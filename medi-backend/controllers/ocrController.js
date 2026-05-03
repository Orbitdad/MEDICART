import Medicine from "../models/Medicine.js";

/* ─────────────────────────────────────────
   HELPER: fuzzy match OCR name → Medicine
   Uses MongoDB text search + fallback regex.
   Returns { medicine, confidence }
───────────────────────────────────────── */
async function fuzzyMatch(rawName) {
  if (!rawName?.trim()) return { medicine: null, confidence: 0 };

  const clean = rawName.trim().toUpperCase();

  // 1. Exact match (case-insensitive)
  let medicine = await Medicine.findOne({
    name: { $regex: `^${clean}$`, $options: "i" },
    isActive: true,
  });
  if (medicine) return { medicine, confidence: 1.0 };

  // 2. Alias exact match
  medicine = await Medicine.findOne({
    searchAliases: { $regex: `^${clean}$`, $options: "i" },
    isActive: true,
  });
  if (medicine) return { medicine, confidence: 0.97 };

  // 3. MongoDB full-text search
  const textResults = await Medicine.find(
    { $text: { $search: clean }, isActive: true },
    { score: { $meta: "textScore" }, name: 1, brand: 1 }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(1);

  if (textResults.length > 0) {
    const score = textResults[0]._doc?.score ?? 0.7;
    const confidence = Math.min(0.95, score / 10);
    return { medicine: textResults[0], confidence };
  }

  // 4. Partial name contains match (last resort)
  // Strip common suffixes to get the root word
  const root = clean.replace(/\s+(TAB|SYP|CAP|INJ|GEL|CREAM|DROPS?|SYRUP|TABLET|CAPSULE|MG|ML)\b.*/i, "").trim();
  if (root.length >= 3) {
    medicine = await Medicine.findOne({
      name: { $regex: root, $options: "i" },
      isActive: true,
    }).limit(1);
    if (medicine) return { medicine, confidence: 0.6 };
  }

  return { medicine: null, confidence: 0 };
}

/* ─────────────────────────────────────────
   POST /api/admin/ocr/scan-invoice
   Body: multipart — field "invoice" = image file
   Returns: array of parsed + fuzzy-matched rows
───────────────────────────────────────── */
export const scanInvoice = async (req, res, next) => {
  try {
    const file = req.file; // single invoice photo
    if (!file) {
      return res.status(400).json({ message: "Invoice image is required" });
    }

    const base64Image = file.buffer.toString("base64");
    const mimeType = file.mimetype; // image/jpeg or image/png

    /* ── Call Claude API to extract invoice rows ── */
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `This is a pharmaceutical supplier invoice (GST Tax Invoice) from India.
Extract ALL medicine/product line items from this invoice into a JSON array.

For each row return EXACTLY this structure (no extra fields):
{
  "itemName": "exact product name as printed",
  "qty": number,
  "free": number or 0,
  "pkg": "packaging e.g. 10TAB 100ML 1BOX",
  "hsn": "HSN code",
  "mfr": "manufacturer/company code or name",
  "batch": "batch number",
  "exp": "expiry MM/YY or MM/YYYY",
  "mrp": number,
  "billRate": number,
  "amount": number,
  "discountPercent": number or 0,
  "gstPercent": number
}

Also extract the invoice header into this structure:
{
  "partyName": "supplier name",
  "billNo": "invoice number",
  "billDate": "date as printed",
  "dueDate": "due date if present"
}

Return ONLY valid JSON in this exact shape, no explanation:
{
  "header": { ...header fields },
  "items": [ ...all rows ]
}

Rules:
- itemName: preserve exact spelling including strength e.g. "ELBIOCID 170ML SYR"
- If a column is missing or illegible, use null
- Numbers must be numeric (not strings)
- Do not skip any row even if partially legible`,
              },
            ],
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error("Claude OCR API error:", err);
      return res.status(502).json({ message: "OCR service error", detail: err });
    }

    const claudeData = await claudeResponse.json();
    const rawText = claudeData.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    /* ── Parse JSON from Claude response ── */
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("OCR JSON parse error:", e, "\nRaw:", rawText);
      return res.status(422).json({
        message: "Could not parse invoice. Try a clearer photo.",
        raw: rawText,
      });
    }

    const { header = {}, items = [] } = parsed;

    /* ── Fuzzy match each item to Medicine master ── */
    const matchedItems = await Promise.all(
      items.map(async (item) => {
        const { medicine, confidence } = await fuzzyMatch(item.itemName);

        return {
          /* Raw OCR data */
          ocrRawName:      item.itemName || "",
          itemName:        medicine?.name || item.itemName || "",
          mfr:             item.mfr || medicine?.brand || "",
          pkg:             item.pkg || medicine?.packaging || "",
          hsnCode:         item.hsn || medicine?.hsnCode || "",
          batch:           item.batch || "",
          exp:             item.exp || "",
          mrp:             item.mrp ?? 0,
          qty:             item.qty ?? 0,
          free:            item.free ?? 0,
          billRate:        item.billRate ?? 0,
          amount:          item.amount ?? 0,
          discountPercent: item.discountPercent ?? 0,
          gstPercent:      item.gstPercent ?? (medicine?.gstPercent ?? 5),

          /* Match result */
          medicineId:      medicine?._id ?? null,
          matchConfidence: confidence,
          isNewMedicine:   !medicine,

          /* For review UI */
          suggestedName:   medicine?.name ?? null,
          medicineImages:  medicine?.images ?? [],
        };
      })
    );

    res.json({
      header,
      items: matchedItems,
      totalItems: matchedItems.length,
      unmatched: matchedItems.filter((i) => !i.medicineId).length,
      lowConfidence: matchedItems.filter(
        (i) => i.medicineId && i.matchConfidence < 0.75
      ).length,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/ocr/search-medicine?q=...
   Used by smart restock search typeahead.
   Returns top 10 matching Medicine masters.
───────────────────────────────────────── */
export const searchMedicine = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json([]);

    const results = await Medicine.find(
      {
        isActive: true,
        $or: [
          { name:          { $regex: q, $options: "i" } },
          { brand:         { $regex: q, $options: "i" } },
          { itemCode:      { $regex: q, $options: "i" } },
          { searchAliases: { $regex: q, $options: "i" } },
        ],
      },
      {
        name: 1, brand: 1, company: 1, packaging: 1,
        hsnCode: 1, gstPercent: 1, salePrice: 1,
        images: 1, category: 1, minStockAlert: 1,
      }
    )
      .limit(10)
      .sort({ name: 1 });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

import Medicine from "../models/Medicine.js";
import { createWorker } from 'tesseract.js';

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

    /* ── Call Tesseract.js locally ── */
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(file.buffer);
    await worker.terminate();

    const rawText = text;
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 5);

    const header = { partyName: "Unknown", billNo: `INV-${Date.now()}` };
    const parsedItems = [];

    // Header extraction guess
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const l = lines[i].toUpperCase();
      if (l.includes("GSTIN") || l.includes("PHARMA") || l.includes("MEDICAL") || l.includes("DISTRIBUTOR") || l.includes("SURGICAL") || l.includes("AGENCY")) {
        header.partyName = lines[i];
        break;
      }
    }

    // Row extraction guess
    for (const line of lines) {
      const expMatch = line.match(/\b(0?[1-9]|1[0-2])[\/\-](20\d{2}|\d{2})\b/);
      const amounts = [...line.matchAll(/\b\d+\.\d{2}\b/g)].map(m => Number(m[0]));
      const ints = [...line.matchAll(/\b\d{1,4}\b/g)].map(m => m[0]);

      if (expMatch && amounts.length >= 2) {
        const exp = expMatch[0];
        const amount = amounts[amounts.length - 1] || 0;
        const billRate = amounts[amounts.length - 2] || amount;
        const mrp = amounts[amounts.length - 3] || billRate;

        let nameText = line.replace(exp, '').replace(/\b\d+\.\d{2}\b/g, '').trim();
        let qty = 1;
        if (ints.length > 0) {
           qty = Number(ints[0]);
           nameText = nameText.replace(new RegExp(`\\b${ints[0]}\\b`), '');
        }

        const words = nameText.split(/\s+/).filter(w => w.length > 2 && !/^\d+$/.test(w));
        const itemName = words.slice(0, 4).join(' ');

        if (itemName) {
          parsedItems.push({
            itemName, qty, free: 0, pkg: "", hsn: "", mfr: "",
            batch: "", exp, mrp, billRate, amount, discountPercent: 0, gstPercent: 5
          });
        }
      }
    }

    if (parsedItems.length === 0) {
      return res.status(422).json({
        message: "No medicine items found. Tesseract could not read the table correctly.",
        raw: rawText,
      });
    }

    /* ── Fuzzy match each item to Medicine master ── */
    const matchedItems = await Promise.all(
      parsedItems.map(async (item) => {
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

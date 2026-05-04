import Medicine from "../models/Medicine.js";
import { createWorker } from "tesseract.js";
import sharp from "sharp";

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

    /* ── Preprocess image and Call Tesseract OCR ── */
    const processedBuffer = await sharp(file.buffer)
      .greyscale()
      .normalize()
      .sharpen()
      .png()
      .toBuffer();

    const worker = await createWorker("eng");
    const { data: { text: rawText } } = await worker.recognize(processedBuffer);
    await worker.terminate();

    if (!rawText || rawText.trim() === "") {
      return res.status(422).json({
        message: "No text found in the invoice image.",
        raw: "",
      });
    }
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

    // Row extraction using MM/YY or MM/YYYY as anchor
    for (const line of lines) {
      // Find the expiry date which serves as our anchor point
      const expMatch = line.match(/\b(0?[1-9]|1[0-2])[\/\-](20\d{2}|\d{2})\b/);
      
      if (expMatch) {
        const exp = expMatch[0];
        const expIndex = line.indexOf(exp);
        
        // Split line into before exp and after exp
        const beforeExp = line.substring(0, expIndex).trim();
        const afterExp = line.substring(expIndex + exp.length).trim();
        
        // After exp: MRP, Price/Rate, Amount, Disc%, GST%
        // Extract all numbers after the expiry
        const afterNumbers = [...afterExp.matchAll(/\b\d+(\.\d{1,2})?\b/g)].map(m => Number(m[0]));
        
        let mrp = 0, billRate = 0, amount = 0, discountPercent = 0, gstPercent = 5;
        
        if (afterNumbers.length >= 3) {
           mrp = afterNumbers[0];
           billRate = afterNumbers[1];
           amount = afterNumbers[2];
           if (afterNumbers.length > 3) discountPercent = afterNumbers[3];
           if (afterNumbers.length > 4) gstPercent = afterNumbers[4];
        } else {
           // Fallback: look at all numbers in the line if the right side is incomplete
           const allAmounts = [...line.matchAll(/\b\d+\.\d{2}\b/g)].map(m => Number(m[0]));
           if (allAmounts.length >= 2) {
             amount = allAmounts[allAmounts.length - 1] || 0;
             billRate = allAmounts[allAmounts.length - 2] || amount;
             mrp = allAmounts[allAmounts.length - 3] || billRate;
           }
        }

        // Before exp: Qty, Free, Item Name, Pkg, HSN, Mfr/Co, Batch No
        let qty = 1;
        let free = 0;
        let remainingBefore = beforeExp;
        
        // Extract Qty and Free from the beginning
        const firstNums = remainingBefore.match(/^(\d+)\s+(\d+)?/);
        if (firstNums) {
            qty = Number(firstNums[1]);
            if (firstNums[2]) {
                free = Number(firstNums[2]);
            }
            remainingBefore = remainingBefore.substring(firstNums[0].length).trim();
        } else {
            const oneNum = remainingBefore.match(/^(\d+)\s+/);
            if (oneNum) {
                qty = Number(oneNum[1]);
                remainingBefore = remainingBefore.substring(oneNum[0].length).trim();
            }
        }
        
        // Extract Batch No (usually the last token before Exp)
        let batch = "";
        const partsBefore = remainingBefore.split(/\s+/);
        if (partsBefore.length > 1) {
            batch = partsBefore.pop(); // The last word is often the batch
        }
        
        // Extract Item Name (usually the first 2-4 tokens of what's left)
        const words = partsBefore.filter(w => w.length >= 2 && !/^\d+$/.test(w));
        const itemName = words.slice(0, Math.min(4, words.length)).join(' ');
        
        // Pkg, HSN, Mfr/Co can be extrapolated from what remains, but not strictly needed for fuzzy match
        
        if (itemName) {
          parsedItems.push({
            itemName, qty, free, pkg: "", hsn: "", mfr: "",
            batch, exp, mrp, billRate, amount, discountPercent, gstPercent
          });
        }
      }
    }

    if (parsedItems.length === 0) {
      return res.status(422).json({
        message: "No medicine items found. Could not read the table correctly.",
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

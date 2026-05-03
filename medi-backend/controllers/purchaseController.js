import Purchase from "../models/Purchase.js";
import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/* ─────────────────────────────────────────
   HELPER: compute item amounts
───────────────────────────────────────── */
function calcItem(item) {
  const qty     = Number(item.qty  || 0);
  const free    = Number(item.free || 0);
  const rate    = Number(item.billRate || item.mrp || 0);
  const disc    = Number(item.discountPercent || 0);
  const gst     = Number(item.gstPercent || 5);

  const gross      = qty * rate;
  const afterDisc  = gross - (gross * disc) / 100;
  const gstAmt     = (afterDisc * gst) / 100;
  const sgst       = gstAmt / 2;
  const cgst       = gstAmt / 2;
  const amount     = afterDisc + gstAmt;

  return { qty, free, gross, afterDisc, sgst, cgst, amount };
}

/* ─────────────────────────────────────────
   HELPER: get or create Medicine master
   Called for each item in the purchase.
   - If medicineId provided → verify it exists
   - If isNewMedicine → create new master record
   - Returns medicine._id
───────────────────────────────────────── */
async function resolveMedicine(item, imageUrl) {
  /* Case 1: Front-end resolved the match */
  if (item.medicineId) {
    const exists = await Medicine.findById(item.medicineId);
    if (exists) return exists._id;
  }

  /* Case 2: Create new medicine master */
  const validCategories = ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR", "OTH"];
  const inferredCategory = validCategories.includes(
    (item.pkg || "").toUpperCase().split(/\d/)[0]
  )
    ? (item.pkg || "").toUpperCase().split(/\d/)[0]
    : "TAB";

  const medicine = await Medicine.create({
    name:        (item.itemName || "").trim(),
    brand:       item.mfr || "",
    company:     item.mfr || "",
    packaging:   item.pkg || "",
    hsnCode:     item.hsnCode || "",
    gstPercent:  Number(item.gstPercent || 5),
    category:    inferredCategory,
    salePrice:   Number(item.salePrice || item.mrp || 0),
    images:      imageUrl ? [imageUrl] : [],
    isActive:    true,
  });

  return medicine._id;
}

/* ─────────────────────────────────────────
   POST /api/admin/purchases
   Accepts:
     - multipart/form-data
     - header fields as flat keys
     - items as JSON string "items"
     - invoice photo as file "invoicePhoto"
     - per-item images as "image_0", "image_1" (only for new medicines)
───────────────────────────────────────── */
export const createPurchase = async (req, res, next) => {
  try {
    /* ── Parse header ── */
    const {
      purchaseType, purchaseNo, partyCode, partyName,
      billNo, entryNo, location, creditDays, headerDiscount,
      entryDate, billDate, receivedDate, dueDate,
      items: itemsJSON,
    } = req.body;

    if (!purchaseNo) {
      return res.status(400).json({ message: "Purchase number is required" });
    }

    let items = [];
    try {
      items = JSON.parse(itemsJSON || "[]");
    } catch {
      return res.status(400).json({ message: "Invalid items data" });
    }
    if (!items.length) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    /* ── Upload files ── */
    const fileMap = {}; // { "image_0": url, "invoicePhoto": url }
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/purchases" }
        );
        fileMap[file.fieldname] = result.secure_url;
      }
    }

    /* ── Build item docs ── */
    let totalQty = 0, totalTaxable = 0,
        totalSgst = 0, totalCgst = 0, totalAmount = 0;

    const itemDocs = await Promise.all(
      items.map(async (item, idx) => {
        const imageUrl = fileMap[`image_${idx}`] || "";

        /* Resolve or create Medicine master */
        const medicineId = await resolveMedicine(item, imageUrl);

        /* If this medicine already has images, don't overwrite */
        if (imageUrl && item.isNewMedicine) {
          await Medicine.findByIdAndUpdate(medicineId, {
            $addToSet: { images: imageUrl },
          });
        }

        /* Compute amounts */
        const { qty, free, afterDisc, sgst, cgst, amount } = calcItem(item);

        totalQty      += qty;
        totalTaxable  += afterDisc;
        totalSgst     += sgst;
        totalCgst     += cgst;
        totalAmount   += amount;

        return {
          medicineId,
          itemName:        item.itemName || "",
          mfr:             item.mfr || "",
          pkg:             item.pkg || "",
          code:            item.code || "",
          hsnCode:         item.hsnCode || "",
          batch:           item.batch || "",
          exp:             item.exp || "",
          mrp:             Number(item.mrp || 0),
          qty,
          free,
          billRate:        Number(item.billRate || 0),
          schemePercent:   Number(item.schemePercent || 0),
          discountPercent: Number(item.discountPercent || 0),
          gstPercent:      Number(item.gstPercent || 5),
          taxableAmount:   afterDisc,
          sgst,
          cgst,
          amount,
          ocrRawName:      item.ocrRawName || "",
          matchConfidence: Number(item.matchConfidence ?? 1),
          isNewMedicine:   Boolean(item.isNewMedicine),
        };
      })
    );

    /* ── Header discount ── */
    const hdrDisc  = Number(headerDiscount || 0);
    const discAmt  = (totalAmount * hdrDisc) / 100;
    const netAmount = totalAmount - discAmt;

    /* ── Save Purchase ── */
    const purchase = await Purchase.create({
      purchaseType:    purchaseType || "CREDIT PURCHASE",
      purchaseNo,
      partyCode:       partyCode || "",
      partyName:       partyName || "",
      billNo:          billNo || "",
      entryNo:         entryNo || "",
      location:        location || "L",
      creditDays:      Number(creditDays || 0),
      headerDiscount:  hdrDisc,
      entryDate:       entryDate   ? new Date(entryDate)   : new Date(),
      billDate:        billDate    ? new Date(billDate)    : new Date(),
      receivedDate:    receivedDate? new Date(receivedDate): new Date(),
      dueDate:         dueDate     ? new Date(dueDate)     : undefined,
      invoicePhotoUrl: fileMap["invoicePhoto"] || "",
      items:           itemDocs,
      totalQty,
      totalTaxable,
      totalSgst,
      totalCgst,
      totalAmount,
      netAmount,
      createdBy:       req.user?._id,
    });

    res.status(201).json({
      message:  `Purchase saved — ${itemDocs.length} item(s) recorded.`,
      purchase,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/purchases
───────────────────────────────────────── */
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("items.medicineId", "name brand images");
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/purchases/:id
───────────────────────────────────────── */
export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("items.medicineId", "name brand images category hsnCode gstPercent");
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json(purchase);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   DELETE /api/admin/purchases/:id
───────────────────────────────────────── */
export const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json({ success: true, message: "Purchase deleted" });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/stock/medicine/:medicineId
   Returns current stock for one medicine
   by aggregating all purchase items.
   Stock = sum of (qty + free) across all batches.
───────────────────────────────────────── */
export const getMedicineStock = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const result = await Purchase.aggregate([
      { $unwind: "$items" },
      { $match: { "items.medicineId": new mongoose.Types.ObjectId(medicineId) } },
      {
        $group: {
          _id: "$items.medicineId",
          totalStock: { $sum: { $add: ["$items.qty", "$items.free"] } },
          batches: {
            $push: {
              batch:   "$items.batch",
              exp:     "$items.exp",
              qty:     "$items.qty",
              free:    "$items.free",
              mrp:     "$items.mrp",
              billDate:"$billDate",
            },
          },
        },
      },
    ]);

    if (!result.length) {
      return res.json({ totalStock: 0, batches: [] });
    }

    res.json(result[0]);
  } catch (err) {
    next(err);
  }
};

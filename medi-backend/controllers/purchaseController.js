import Purchase from "../models/Purchase.js";
import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";

/* ----------------------------------
   ADMIN: CREATE PURCHASE
   POST /api/admin/purchases
   Body: multipart/form-data
   - header fields as flat keys
   - items as JSON string "items"
   - images as files named "image_0", "image_1", etc.
----------------------------------- */
export const createPurchase = async (req, res, next) => {
    try {
        /* ── Parse header fields ── */
        const {
            purchaseType,
            purchaseNo,
            partyCode,
            partyName,
            billNo,
            entryNo,
            location,
            creditDays,
            headerDiscount,
            entryDate,
            billDate,
            receivedDate,
            items: itemsJSON,
        } = req.body;

        if (!purchaseNo) {
            return res.status(400).json({ message: "Purchase number is required" });
        }

        /* ── Parse items ── */
        let items = [];
        try {
            items = JSON.parse(itemsJSON || "[]");
        } catch {
            return res.status(400).json({ message: "Invalid items data" });
        }

        if (!items.length) {
            return res
                .status(400)
                .json({ message: "At least one item is required" });
        }

        /* ── Upload images to Cloudinary ── */
        const fileMap = {}; // { "image_0": cloudinaryUrl, ... }

        if (req.files?.length) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
                    { folder: "medicart/purchases" }
                );
                fileMap[file.fieldname] = result.secure_url;
            }
        }

        /* ── Build item docs & attach image URLs ── */
        let totalQty = 0;
        let totalTaxable = 0;
        let totalSgst = 0;
        let totalCgst = 0;
        let totalAmount = 0;

        const itemDocs = items.map((item, idx) => {
            const imageKey = `image_${idx}`;
            const imageUrl = fileMap[imageKey] || "";

            const qty = Number(item.qty || 0);
            const rate =
                item.billRate !== "" && item.billRate != null
                    ? Number(item.billRate)
                    : Number(item.mrp || 0);
            const disc = Number(item.discountPercent || 0);
            const gst = Number(item.gstPercent || 0);

            const gross = qty * rate;
            const afterDisc = gross - (gross * disc) / 100;
            const gstAmt = (afterDisc * gst) / 100;
            const halfGst = gstAmt / 2;
            const amount = afterDisc + gstAmt;

            totalQty += qty;
            totalTaxable += afterDisc;
            totalSgst += halfGst;
            totalCgst += halfGst;
            totalAmount += amount;

            return {
                code: item.code || "",
                itemName: item.itemName,
                mfr: item.mfr || "",
                pkg: item.pkg || "",
                batch: item.batch || "",
                exp: item.exp || "",
                mrp: Number(item.mrp || 0),
                qty,
                free: Number(item.free || 0),
                billRate: Number(item.billRate || 0),
                schemePercent: Number(item.schemePercent || 0),
                discountPercent: disc,
                gstPercent: gst,
                salePrice: Number(item.salePrice || 0),
                hsnCode: item.hsnCode || "",
                taxableAmount: afterDisc,
                sgst: halfGst,
                cgst: halfGst,
                amount,
                imageUrl,
            };
        });

        const hdrDisc = Number(headerDiscount || 0);
        const discAmt = (totalAmount * hdrDisc) / 100;
        const netAmount = totalAmount - discAmt;

        /* ── Save to DB ── */
        const purchase = await Purchase.create({
            purchaseType: purchaseType || "CREDIT PURCHASE",
            purchaseNo,
            partyCode: partyCode || "",
            partyName: partyName || "",
            billNo: billNo || "",
            entryNo: entryNo || "",
            location: location || "L",
            creditDays: Number(creditDays || 0),
            headerDiscount: hdrDisc,
            entryDate: entryDate ? new Date(entryDate) : new Date(),
            billDate: billDate ? new Date(billDate) : new Date(),
            receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
            items: itemDocs,
            totalQty,
            totalTaxable,
            totalSgst,
            totalCgst,
            totalAmount,
            netAmount,
            createdBy: req.user?._id,
        });

        /* ── Update Medicine stock for matching items ── */
        for (const item of itemDocs) {
            if (item.itemName) {
                await Medicine.findOneAndUpdate(
                    { name: { $regex: `^${item.itemName.trim()}$`, $options: "i" } },
                    { $inc: { stock: item.qty + (item.free || 0) } }
                );
            }
        }

        res.status(201).json({
            message: `Purchase saved — ${itemDocs.length} item(s) recorded.`,
            purchase,
        });
    } catch (err) {
        next(err);
    }
};

/* ----------------------------------
   ADMIN: GET ALL PURCHASES
   GET /api/admin/purchases
----------------------------------- */
export const getPurchases = async (req, res, next) => {
    try {
        const purchases = await Purchase.find()
            .sort({ createdAt: -1 })
            .populate("createdBy", "name email");
        res.json(purchases);
    } catch (err) {
        next(err);
    }
};

/* ----------------------------------
   ADMIN: GET SINGLE PURCHASE
   GET /api/admin/purchases/:id
----------------------------------- */
export const getPurchaseById = async (req, res, next) => {
    try {
        const purchase = await Purchase.findById(req.params.id).populate(
            "createdBy",
            "name email"
        );
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        res.json(purchase);
    } catch (err) {
        next(err);
    }
};

/* ----------------------------------
   ADMIN: DELETE PURCHASE
   DELETE /api/admin/purchases/:id
----------------------------------- */
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

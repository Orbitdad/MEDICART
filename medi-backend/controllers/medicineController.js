import Medicine from "../models/Medicine.js";
import Purchase from "../models/Purchase.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/* ─────────────────────────────────────────
   HELPER: get stock for multiple medicines
   via a single aggregation.
   Returns Map<medicineId string, stockQty>
───────────────────────────────────────── */
async function getStockMap(medicineIds) {
  const results = await Purchase.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.medicineId": {
          $in: medicineIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    {
      $group: {
        _id:        "$items.medicineId",
        totalStock: { $sum: { $add: ["$items.qty", "$items.free"] } },
        nearestExp: { $min: "$items.exp" },
        latestMrp:  { $last: "$items.mrp" },
      },
    },
  ]);

  const map = new Map();
  for (const r of results) {
    map.set(r._id.toString(), {
      stock:      r.totalStock,
      nearestExp: r.nearestExp,
      latestMrp:  r.latestMrp,
    });
  }
  return map;
}

/* ─────────────────────────────────────────
   DOCTOR: GET MEDICINES (in-stock only)
   GET /api/medicines?search=...
───────────────────────────────────────── */
export const getMedicines = async (req, res, next) => {
  try {
    const filter = { isActive: true };

    if (req.query.search) {
      const regex = { $regex: req.query.search, $options: "i" };
      filter.$or = [
        { name:          regex },
        { brand:         regex },
        { company:       regex },
        { searchAliases: regex },
      ];
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });

    /* Attach live stock from purchases */
    const ids    = medicines.map((m) => m._id);
    const stockMap = await getStockMap(ids);

    const withStock = medicines
      .map((m) => {
        const stockData = stockMap.get(m._id.toString()) || {};
        return {
          ...m.toObject(),
          stock:      stockData.stock      ?? 0,
          nearestExp: stockData.nearestExp ?? null,
          latestMrp:  stockData.latestMrp  ?? 0,
        };
      })
      .filter((m) => m.stock > 0); // only in-stock

    res.json(withStock);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: GET ALL MEDICINES
   GET /api/admin/medicines
───────────────────────────────────────── */
export const adminGetMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });

    const ids      = medicines.map((m) => m._id);
    const stockMap = await getStockMap(ids);

    const withStock = medicines.map((m) => {
      const stockData = stockMap.get(m._id.toString()) || {};
      return {
        ...m.toObject(),
        stock:      stockData.stock      ?? 0,
        nearestExp: stockData.nearestExp ?? null,
        latestMrp:  stockData.latestMrp  ?? 0,
      };
    });

    res.json(withStock);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: CREATE MEDICINE (master only)
   POST /api/admin/medicines
   No stock / expiry / mrp here — those come via purchases.
───────────────────────────────────────── */
export const adminCreateMedicine = async (req, res, next) => {
  try {
    const {
      name, brand, company, companyCode, itemCode,
      description, packaging, packing, salt,
      gstPercent, hsnCode, salePrice, category,
      minStockAlert, searchAliases,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    /* Upload images */
    const imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/medicines" }
        );
        imageUrls.push(result.secure_url);
      }
    }

    /* Parse aliases */
    let aliases = [];
    if (searchAliases) {
      try {
        aliases = typeof searchAliases === "string"
          ? JSON.parse(searchAliases)
          : searchAliases;
      } catch { aliases = []; }
    }

    const medicine = await Medicine.create({
      name:          name.trim(),
      brand:         brand?.trim()       || "",
      company:       company?.trim()     || "",
      companyCode:   companyCode?.trim() || "",
      itemCode:      itemCode?.trim()    || "",
      description:   description?.trim()|| "",
      packaging:     packaging?.trim()   || "",
      packing:       packing?.trim()     || "",
      salt:          salt?.trim()        || "",
      hsnCode:       hsnCode?.trim()     || "",
      gstPercent:    gstPercent ? Number(gstPercent) : 5,
      salePrice:     salePrice  ? Number(salePrice)  : 0,
      category,
      minStockAlert: minStockAlert ? Number(minStockAlert) : 10,
      searchAliases: aliases,
      images:        imageUrls,
      createdBy:     req.user?._id,
    });

    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: UPDATE MEDICINE
   PUT /api/admin/medicines/:id
───────────────────────────────────────── */
export const adminUpdateMedicine = async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "brand", "company", "companyCode", "itemCode",
      "description", "packaging", "packing", "salt",
      "hsnCode", "gstPercent", "salePrice", "category",
      "minStockAlert", "isActive", "searchAliases",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    /* Handle image removals */
    let currentImages = [...(medicine.images || [])];
    if (req.body.removedImages) {
      try {
        const toRemove = JSON.parse(req.body.removedImages);
        if (Array.isArray(toRemove)) {
          currentImages = currentImages.filter((url) => !toRemove.includes(url));
        }
      } catch { /* ignore */ }
    }

    /* Upload new images — AutoImage processed images land here */
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/medicines" }
        );
        currentImages.push(result.secure_url);
      }
    }

    updates.images = currentImages;

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: DELETE MEDICINE
   DELETE /api/admin/medicines/:id
───────────────────────────────────────── */
export const adminDeleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: LOW STOCK REPORT
   GET /api/admin/medicines/low-stock
   Returns medicines where stock < minStockAlert
───────────────────────────────────────── */
export const adminLowStock = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ isActive: true });
    const ids       = medicines.map((m) => m._id);
    const stockMap  = await getStockMap(ids);

    const low = medicines
      .map((m) => ({
        ...m.toObject(),
        stock: stockMap.get(m._id.toString())?.stock ?? 0,
      }))
      .filter((m) => m.stock <= m.minStockAlert);

    res.json(low);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────
   ADMIN: DELETE ALL OUT-OF-STOCK
   DELETE /api/admin/medicines/out-of-stock
───────────────────────────────────────── */
export const adminDeleteOutOfStock = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ isActive: true }, "_id");
    const ids       = medicines.map((m) => m._id);
    const stockMap  = await getStockMap(ids);

    const zeroIds = ids.filter(
      (id) => (stockMap.get(id.toString())?.stock ?? 0) === 0
    );

    const result = await Medicine.deleteMany({ _id: { $in: zeroIds } });

    res.json({
      success:      true,
      deletedCount: result.deletedCount,
      message:      `${result.deletedCount} out-of-stock medicine(s) deleted`,
    });
  } catch (err) {
    next(err);
  }
};

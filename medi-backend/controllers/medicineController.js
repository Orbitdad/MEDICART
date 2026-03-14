import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";

/* ----------------------------------
   DOCTOR: GET MEDICINES (PUBLIC)
----------------------------------- */
export const getMedicines = async (req, res, next) => {
  try {
    const filter = { stock: { $gt: 0 } };

    if (req.query.search) {
      const regex = { $regex: req.query.search, $options: "i" };
      filter.$or = [
        { name: regex },
        { company: regex },
        { brand: regex },
      ];
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });

    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: GET ALL MEDICINES
----------------------------------- */
export const adminGetMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: CREATE MEDICINE
----------------------------------- */
export const adminCreateMedicine = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      company,
      companyCode,
      itemCode,
      description,
      packaging,
      packing,
      mrp,
      price,
      cost,
      gstPercent,
      stock,
      expiryDate,
      category,
    } = req.body;


    /* ✅ HARD VALIDATION */
    if (
      !name ||
      !price ||
      !stock ||
      !category ||
      !mrp ||
      !expiryDate
    ) {
      return res.status(400).json({
        message:
          "Name, MRP, price, stock, expiry date and category are required",
      });
    }

    /* --------------------------
       UPLOAD IMAGES
    -------------------------- */
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

    const medicine = await Medicine.create({
      name: name.trim(),
      brand: brand?.trim() || "",
      company: company?.trim() || "",
      companyCode: companyCode?.trim() || "",
      itemCode: itemCode?.trim() || "",
      description: description?.trim() || "",
      packaging: packaging?.trim() || "",
      packing: packing?.trim() || "",
      mrp: Number(mrp),
      price: Number(price),
      cost: cost ? Number(cost) : 0,
      gstPercent: gstPercent ? Number(gstPercent) : 5,
      stock: Number(stock),
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      category,
      images: imageUrls,
    });


    res.status(201).json(medicine);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: UPDATE MEDICINE
----------------------------------- */
export const adminUpdateMedicine = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "brand",
      "company",
      "companyCode",
      "itemCode",
      "description",
      "packaging",
      "packing",
      "mrp",
      "price",
      "cost",
      "gstPercent",
      "stock",
      "expiryDate",
      "category",
      "isActive",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] =
          key === "expiryDate"
            ? new Date(req.body[key])
            : req.body[key];
      }
    }

    /* --------------------------
       HANDLE IMAGE REMOVALS
    -------------------------- */
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    let currentImages = [...(medicine.images || [])];

    // removedImages comes as a JSON string array of URLs to remove
    if (req.body.removedImages) {
      try {
        const toRemove = JSON.parse(req.body.removedImages);
        if (Array.isArray(toRemove)) {
          currentImages = currentImages.filter(
            (url) => !toRemove.includes(url)
          );
        }
      } catch {
        // ignore parse errors
      }
    }

    /* --------------------------
       UPLOAD NEW IMAGES
    -------------------------- */
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

/* ----------------------------------
   ADMIN: DELETE MEDICINE
----------------------------------- */
export const adminDeleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: DELETE ALL OUT-OF-STOCK
----------------------------------- */
export const adminDeleteOutOfStock = async (req, res, next) => {
  try {
    const result = await Medicine.deleteMany({ stock: 0 });

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} out-of-stock medicine(s) deleted`,
    });
  } catch (err) {
    next(err);
  }
};

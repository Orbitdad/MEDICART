import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";

/* ----------------------------------
   DOCTOR: GET MEDICINES (PUBLIC)
----------------------------------- */
export const getMedicines = async (req, res, next) => {
  try {
    const q = req.query.search
      ? { name: { $regex: req.query.search, $options: "i" } }
      : {};

    const medicines = await Medicine.find({
      ...q,
      isActive: true,
    }).sort({ name: 1 });

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
  description,
  packaging,
  mrp,
  price,
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
  brand: brand?.trim(),
  description: description?.trim(),
  packaging: packaging?.trim(),
  mrp: Number(mrp),
  price: Number(price),
  gstPercent: gstPercent ? Number(gstPercent) : 5,
  stock: Number(stock),
  expiryDate: new Date(expiryDate),
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
      "description",
      "packaging",
      "mrp",
      "price",
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

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

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

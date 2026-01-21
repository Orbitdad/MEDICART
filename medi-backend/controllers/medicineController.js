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
   ADMIN: CREATE MEDICINE (WITH IMAGES)
----------------------------------- */
export const adminCreateMedicine = async (req, res, next) => {
  try {
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
      name: req.body.name,
      brand: req.body.brand,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
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
    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: DELETE MEDICINE (HARD DELETE)
   🔴 ONLY CHANGE IN THIS FILE
----------------------------------- */
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

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Load env from backend
try {
  const envPath = path.join(__dirname, "..", "medi-backend", ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      const val = match[2].replace(/^["']|["']$/g, "").trim();
      if (!process.env[key]) process.env[key] = val;
    }
  });
} catch (err) {
  console.log("No .env found, using process.env");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Medicine = mongoose.model("Medicine", new mongoose.Schema({
  name: String,
  images: [String]
}, { strict: false }));

const localImages = {
  "TAB": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\tablet_strip_1773583867923.png",
  "CAP": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\capsule_pack_1773583983886.png",
  "SYRINGE": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\syringe_1773584016629.png",
  "CREAM": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\cream_tube_1773584054820.png",
  "GEL": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\gel_tube_1773584106817.png",
  "OINT": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\ointment_tube_1773584124428.png"
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const uploadedUrls = {};

  console.log("Uploading placeholders...");
  for (const [key, filePath] of Object.entries(localImages)) {
    try {
      console.log(`Uploading ${key} from ${filePath}...`);
      const res = await cloudinary.uploader.upload(filePath, { folder: "medicart/v2" });
      uploadedUrls[key] = res.secure_url;
      console.log(`${key} uploaded: ${res.secure_url}`);
    } catch (err) {
      console.error(`FAILED to upload ${key}: ${err.message}`);
    }
  }

  // Fallback URLs (Placehold.co - robust)
  const placeholders = {
    "INJ": "https://placehold.co/600x600/f8f9fa/495057?text=Injection%0AVial",
    "SYP": "https://placehold.co/600x600/f8f9fa/495057?text=Syrup%0ABottle",
    "NEEDLE": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0ANeedle",
    "MASK": "https://placehold.co/600x600/f8f9fa/495057?text=Face%0AMask",
    "GLOVE": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0AGloves",
    "GENERIC": "https://placehold.co/600x600/f8f9fa/495057?text=Medicine"
  };

  const medicines = await Medicine.find({});
  console.log(`Processing ${medicines.length} products...`);

  for (const med of medicines) {
    const name = (med.name || "").toUpperCase();
    let img = placeholders.GENERIC;

    // Matching logic
    if (name.includes("SYR") || name.includes("SYRING") || name.includes(" SY ") || name.includes(".SY") || name.includes("SY ")) {
       if (name.includes("SYP") || name.includes("SYRUP")) {
         img = placeholders.SYP;
       } else {
         img = uploadedUrls.SYRINGE;
       }
    } else if (name.includes("TAB")) {
      img = uploadedUrls.TAB;
    } else if (name.includes("CAP")) {
      img = uploadedUrls.CAP;
    } else if (name.includes("CREAM")) {
      img = uploadedUrls.CREAM;
    } else if (name.includes("GEL") && !name.includes("GELATIN")) {
      img = uploadedUrls.GEL;
    } else if (name.includes("OINT")) {
      img = uploadedUrls.OINT;
    } else if (name.includes("INJ") || name.includes("VIAL") || name.includes("AMP")) {
      img = placeholders.INJ;
    } else if (name.includes("NEEDLE")) {
      img = placeholders.NEEDLE;
    } else if (name.includes("MASK")) {
      img = placeholders.MASK;
    } else if (name.includes("GLOVE")) {
      img = placeholders.GLOVE;
    }

    await Medicine.updateOne({ _id: med._id }, { $set: { images: [img] } });
  }

  console.log("Assignment complete.");
  await mongoose.disconnect();
}

main().catch(console.error);

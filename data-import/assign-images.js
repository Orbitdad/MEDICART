const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Auto-load env from medi-backend
try {
  const envPath = path.join(__dirname, "..", "medi-backend", ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      const val = match[2].replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {
  console.log("No .env found in medi-backend");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const medicineSchema = new mongoose.Schema({
  name: String,
  company: String,
  images: [String],
  category: String
}, { strict: false });

const Medicine = mongoose.model("Medicine", medicineSchema);

const localImages = {
  "TAB": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\tablet_strip_1773583867923.png",
  "CAP": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\capsule_pack_1773583983886.png",
  "SYRINGE": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\syringe_1773584016629.png",
  "CREAM": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\cream_tube_1773584054820.png",
  "GEL": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\gel_tube_1773584106817.png",
  "OINT": "C:\\Users\\manda\\.gemini\\antigravity\\brain\\b77c7ac8-e379-4ca6-b707-84141fbc08f4\\ointment_tube_1773584124428.png"
};

const externalImages = {
  "NEEDLE": "https://placehold.co/600x600/f8f9fa/495057?text=Needle%0A(Medical)",
  "GAUZE": "https://placehold.co/600x600/f8f9fa/495057?text=Gauze%0A%26%20Dressing",
  "BANDAGE": "https://placehold.co/600x600/f8f9fa/495057?text=Bandage",
  "COTTON": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0ACotton",
  "FORCEP": "https://placehold.co/600x600/f8f9fa/495057?text=Surgical%0AForceps",
  "SCISSOR": "https://placehold.co/600x600/f8f9fa/495057?text=Surgical%0AScissors",
  "MASK": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0AMask",
  "GLOVE": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0AGloves",
  "TAPE": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0ATape",
  "SYP": "https://placehold.co/600x600/f8f9fa/495057?text=Syrup",
  "SYRUP": "https://placehold.co/600x600/f8f9fa/495057?text=Syrup",
  "LIQUID": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0ALiquid",
  "INJ": "https://placehold.co/600x600/f8f9fa/495057?text=Injection%0AVial",
  "SOAP": "https://placehold.co/600x600/f8f9fa/495057?text=Medicated%0ASoap",
  "WASH": "https://placehold.co/600x600/f8f9fa/495057?text=Medical%0AWash",
  "FALLBACK": "https://placehold.co/600x600/f8f9fa/495057?text=Generic%0AMedicine"
};

async function uploadToCloudinary(filePathOrUrl, folder) {
  try {
    const result = await cloudinary.uploader.upload(filePathOrUrl, { folder });
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error for " + filePathOrUrl + ":", err.message);
    return null;
  }
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set.");
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB.");

  const uploadedUrls = {};

  console.log("Uploading local generated images...");
  for (const [key, path] of Object.entries(localImages)) {
    console.log(`Uploading ${key}...`);
    const url = await uploadToCloudinary(path, "medicart/categories");
    if (url) uploadedUrls[key] = url;
  }

  console.log("Uploading external fallback images...");
  for (const [key, externalUrl] of Object.entries(externalImages)) {
    console.log(`Uploading ${key}...`);
    const url = await uploadToCloudinary(externalUrl, "medicart/categories");
    if (url) uploadedUrls[key] = url;
  }

  console.log("Finished uploading images.");

  // Now assignment logic
  console.log("\n--- Starting DB Update ---");
  const medicines = await Medicine.find({});
  let counts = {
    SYRINGE: 0,
    TAB: 0,
    CAP: 0,
    CREAM: 0,
    GEL: 0,
    OINT: 0,
    NEEDLE: 0,
    GAUZE: 0,
    BANDAGE: 0,
    COTTON: 0,
    FORCEP: 0,
    SCISSOR: 0,
    MASK: 0,
    GLOVE: 0,
    TAPE: 0,
    SYP: 0,
    INJ: 0,
    SOAP: 0,
    FALLBACK: 0
  };

  const total = medicines.length;
  let processed = 0;

  for (const med of medicines) {
    const nameUpper = (med.name || "").toUpperCase();
    let assignedKey = null;

    // Checks (Priority order: Syringe > Needle > Liquids > Solids > Fallback)
    if (nameUpper.includes("SYRING") || nameUpper.includes("SYR") || nameUpper.includes(" SY ") || nameUpper.includes("SY.")) {
      assignedKey = "SYRINGE";
    } else if (nameUpper.includes("NEEDLE")) {
      assignedKey = "NEEDLE";
    } else if (nameUpper.includes("INJ") || nameUpper.includes("VIAL") || nameUpper.includes("AMP")) {
      assignedKey = "INJ";
    } else if (nameUpper.includes("SYP") || nameUpper.includes("SYRUP") || nameUpper.includes("LIQUID") || nameUpper.includes("SOLN") || nameUpper.includes("DROPS")) {
      assignedKey = "SYP";
    } else if (nameUpper.includes("TAB")) {
      assignedKey = "TAB";
    } else if (nameUpper.includes("CAP")) {
      assignedKey = "CAP";
    } else if (nameUpper.includes("CREAM")) {
      assignedKey = "CREAM";
    } else if (nameUpper.includes("GEL") && !nameUpper.includes("GELATIN")) {
      assignedKey = "GEL";
    } else if (nameUpper.includes("OINT")) {
      assignedKey = "OINT";
    } else if (nameUpper.includes("GAUZE") || nameUpper.includes("GAUSE")) {
      assignedKey = "GAUZE";
    } else if (nameUpper.includes("BANDAGE") || nameUpper.includes("CREPE") || nameUpper.includes("PLASTER")) {
      assignedKey = "BANDAGE";
    } else if (nameUpper.includes("COTTON")) {
      assignedKey = "COTTON";
    } else if (nameUpper.includes("FORCEP")) {
      assignedKey = "FORCEP";
    } else if (nameUpper.includes("SCISSOR") || nameUpper.includes("SCIS")) {
      assignedKey = "SCISSOR";
    } else if (nameUpper.includes("MASK")) {
      assignedKey = "MASK";
    } else if (nameUpper.includes("GLOVE")) {
      assignedKey = "GLOVE";
    } else if (nameUpper.includes("TAPE") || nameUpper.includes("MICROPORE") || nameUpper.includes("ADHESIVE")) {
      assignedKey = "TAPE";
    } else if (nameUpper.includes("SOAP") || nameUpper.includes("WASH")) {
      assignedKey = "SOAP";
    } else {
      assignedKey = "FALLBACK";
    }

    const imgUrl = uploadedUrls[assignedKey] || uploadedUrls["FALLBACK"];
    
    if (imgUrl) {
      try {
        await Medicine.updateOne({ _id: med._id }, { $set: { images: [imgUrl] } });
        counts[assignedKey]++;
      } catch (err) {
        console.error(`Error updating ${med._id}: ${err.message}`);
      }
    }

    processed++;
    if (processed % 500 === 0) {
      console.log(`Processed ${processed}/${total} products...`);
    }
  }

  console.log("\n--- FINAL UPDATE SUMMARY ---");
  Object.entries(counts).forEach(([k, c]) => {
    if (c > 0) console.log(`${k.padEnd(10)}: ${c}`);
  });
  console.log(`Total Updated: ${processed}`);

  await mongoose.disconnect();
  console.log("\n✅ Done.");
}


main().catch(console.error);

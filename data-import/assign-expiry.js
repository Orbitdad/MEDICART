/**
 * One-time migration script
 * Reads exp.csv → picks latest expiry date per itemCode → updates Medicine docs in MongoDB
 *
 * Usage:
 *   set MONGO_URI=mongodb+srv://...   (or your local URI)
 *   node assign-expiry.js
 */

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

/* Load .env from the backend folder so MONGO_URI is available */
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
  /* .env not found — user must set MONGO_URI manually */
}

/* ---------- Medicine schema (mirror of backend model) ---------- */
const medicineSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    company: String,
    companyCode: String,
    itemCode: String,
    description: String,
    packaging: String,
    packing: String,
    mrp: Number,
    price: Number,
    cost: Number,
    gstPercent: Number,
    stock: Number,
    expiryDate: Date,
    category: String,
    images: [String],
    isActive: Boolean,
  },
  { timestamps: true }
);

const Medicine = mongoose.model("Medicine", medicineSchema);

/* ---------- Helpers ---------- */
function clean(val) {
  if (!val) return "";
  return val.replace(/^"+|"+$/g, "").trim(); // strip quotes + whitespace
}

function parseDate(val) {
  if (!val || val === "NULL") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------- Main ---------- */
async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌  Set MONGO_URI environment variable first.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  /* ---- Step 1: Parse CSV and group by itemCode ---- */
  const expiryMap = {}; // itemCode → latest Date

  await new Promise((resolve, reject) => {
    fs.createReadStream("exp.csv")
      .pipe(csv({ headers: ["itemCode", "name", "batchNo", "expiryDate"] }))
      .on("data", (row) => {
        const code = clean(row.itemCode);
        if (!code) return;

        const date = parseDate(clean(row.expiryDate));
        if (!date) return; // skip NULL / invalid

        if (!expiryMap[code] || date > expiryMap[code]) {
          expiryMap[code] = date;
        }
      })
      .on("end", resolve)
      .on("error", reject);
  });

  const totalCodes = Object.keys(expiryMap).length;
  console.log(`📋  Found ${totalCodes} unique itemCodes with valid expiry dates`);

  /* ---- Step 2: Update medicines in DB ---- */
  let updated = 0;
  let noMatch = 0;
  let failed = 0;

  for (const [code, latestExpiry] of Object.entries(expiryMap)) {
    try {
      const result = await Medicine.updateMany(
        { itemCode: code },
        { $set: { expiryDate: latestExpiry } }
      );

      if (result.matchedCount > 0) {
        updated += result.matchedCount;
      } else {
        noMatch++;
      }
    } catch (err) {
      failed++;
      console.error(`  ⚠️  Failed to update itemCode "${code}":`, err.message);
    }
  }

  /* ---- Summary ---- */
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  📊  Migration Summary");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Unique itemCodes in CSV  : ${totalCodes}`);
  console.log(`  Medicine docs updated    : ${updated}`);
  console.log(`  itemCodes with no match  : ${noMatch}`);
  console.log(`  Errors                   : ${failed}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  console.log("✅  Done — disconnected from MongoDB");
}

main().catch((err) => {
  console.error("❌  Fatal error:", err);
  process.exit(1);
});

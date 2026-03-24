/**
 * assign-categories.js
 *
 * One-shot migration: scans every Medicine document and assigns a
 * category (CAP, SYP, TAB, EE, INJ, INSTR) based on name keywords.
 *
 * Usage:  node assign-categories.js
 */
const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://mandavkaradarsh2005_db_user:sRQ2fFlIgdK1JYku@cluster0.dltfqrc.mongodb.net/medicart";

/* ---------- keyword → category rules ---------- */
const RULES = [
  // Order matters — first match wins
  { keywords: [" CAP", "CAP.", "CAP ","CAPSULE", "CAPS"], category: "CAP" },
  { keywords: [" SYP", "SYP.", "SYP ", "SYRUP", "SUSP", "SUSPENSION", "DROPS", "DROP", " DRP", "LIQUID", "ORAL SOL", "SOLUTN", "SOLUTION", "TONIC", "ELIXIR"], category: "SYP" },
  { keywords: ["EYE", "EAR", "E/E", "E/D", "E.D.", "OPTIC"], category: "EE" },
  { keywords: ["INJ", "INJECTION", "VIAL", "AMPOULE", "AMP "], category: "INJ" },
  { keywords: ["SYRINGE", "SYR", "NEEDLE", "FORCEP", "SCISSOR", "GAUZE", "BANDAGE", "COTTON", "MASK", "GLOVE", "CATHETER", "CANULA", "THERMOM", "STETHE", "STETH", "SCOUP", "STEPPLER", "HOLDER", "ARTRY", "ARTARY", "ARTERY"], category: "INSTR" },
  { keywords: [" TAB", "TAB.", "TAB ", "TABLET"], category: "TAB" },
];

function detectCategory(name) {
  const upper = (" " + name + " ").toUpperCase();
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (upper.includes(kw.toUpperCase())) {
        return rule.category;
      }
    }
  }
  return "TAB"; // default fallback
}

/* ---------- Mongoose inline schema ---------- */
const medicineSchema = new mongoose.Schema({}, { strict: false });
const Medicine = mongoose.model("Medicine", medicineSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const meds = await Medicine.find({});
  console.log(`📦 Total medicines: ${meds.length}`);

  const counts = { CAP: 0, SYP: 0, TAB: 0, EE: 0, INJ: 0, INSTR: 0 };
  let updated = 0;

  for (const med of meds) {
    const cat = detectCategory(med.name || "");
    counts[cat] = (counts[cat] || 0) + 1;

    if (med.category !== cat) {
      await Medicine.updateOne({ _id: med._id }, { $set: { category: cat } });
      updated++;
    }
  }

  console.log("\n=== Category Assignment Results ===");
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));
  console.log(`\n✅ Updated ${updated} documents`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});

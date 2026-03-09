import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// local DB
const LOCAL_URI = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/medicart";

// atlas DB — MUST be set via .env
const ATLAS_URI = process.env.ATLAS_URI;
if (!ATLAS_URI) {
  console.error("❌ ATLAS_URI is not set in .env — aborting migration.");
  process.exit(1);
}

async function migrate() {
  console.log("Connecting local...");
  const localConn = await mongoose.createConnection(LOCAL_URI);

  console.log("Connecting atlas...");
  const atlasConn = await mongoose.createConnection(ATLAS_URI);

  const collections = ["users", "medicines", "orders"];

  for (const name of collections) {
    const data = await localConn.collection(name).find().toArray();

    if (data.length > 0) {
      await atlasConn.collection(name).insertMany(data);
      console.log(`Migrated ${name}: ${data.length}`);
    }
  }

  console.log("Migration completed successfully");
  process.exit();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});

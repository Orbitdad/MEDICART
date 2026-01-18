import dotenv from "dotenv";
import mongoose from "mongoose";
import Medicine from "./models/Medicine.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

await Medicine.deleteMany();

await Medicine.insertMany([
  { name: "Dolo 650", brand: "Micro Labs", price: 25, stock: 200 },
  { name: "Azithromycin 500", brand: "Cipla", price: 85, stock: 80 },
  { name: "Amoxycillin 250", brand: "Sun Pharma", price: 50, stock: 100 },
]);

console.log("✅ Medicines seeded");
process.exit();

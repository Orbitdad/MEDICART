const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://mandavkaradarsh2005_db_user:sRQ2fFlIgdK1JYku@cluster0.dltfqrc.mongodb.net/medicart";

async function run() {
  await mongoose.connect(MONGO_URI);

  const col = mongoose.connection.db.collection("medicines");
  const total = await col.countDocuments();
  const zeroStock = await col.countDocuments({ stock: 0 });
  const nullStock = await col.countDocuments({ stock: null });
  const noStockField = await col.countDocuments({ stock: { $exists: false } });
  const positiveStock = await col.countDocuments({ stock: { $gt: 0 } });

  console.log("Total medicines:", total);
  console.log("Stock = 0:", zeroStock);
  console.log("Stock = null:", nullStock);
  console.log("Stock field missing:", noStockField);
  console.log("Stock > 0:", positiveStock);

  await mongoose.disconnect();
}

run().catch(function (err) {
  console.error(err);
  process.exit(1);
});

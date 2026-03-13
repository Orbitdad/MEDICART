const fs = require("fs");
const csv = require("csv-parser");

const headers = [
  "ItemCd",
  "ItemName",
  "CoCd",
  "BillName",
  "Packing",
  "Stock",
  "Cost",
  "Price",
  "MRP"
];

let results = [];

fs.createReadStream("medicines.csv")
  .pipe(csv({ headers: headers }))
  .on("data", (data) => {
    results.push({
      itemCode: data.ItemCd?.trim(),
      name: data.ItemName?.trim(),
      companyCode: data.CoCd?.trim(),
      company: data.BillName?.trim(),
      packing: data.Packing,
      stock: Number(data.Stock),
      cost: Number(data.Cost),
      price: Number(data.Price),
      mrp: Number(data.MRP)
    });
  })
  .on("end", () => {
    fs.writeFileSync("medicines.json", JSON.stringify(results, null, 2));
    console.log("JSON file created successfully");
  });

const data = require("./medicines.json");

// Top companies
const companies = {};
data.forEach(m => {
  const c = m.company || "UNKNOWN";
  companies[c] = (companies[c] || 0) + 1;
});
console.log("\n=== TOP 30 COMPANIES ===");
Object.entries(companies)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([name, count]) => console.log(`  ${count}\t${name}`));

// Common keywords in product names
const keywords = {};
data.forEach(m => {
  m.name.split(/\s+/).forEach(w => {
    const k = w.toUpperCase();
    keywords[k] = (keywords[k] || 0) + 1;
  });
});
console.log("\n=== TOP 50 KEYWORDS IN NAMES ===");
Object.entries(keywords)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 50)
  .forEach(([name, count]) => console.log(`  ${count}\t${name}`));

// Products with existing images
const withImages = data.filter(m => m.images && m.images.length > 0).length;
console.log(`\n=== IMAGE STATS ===`);
console.log(`  Total products: ${data.length}`);
console.log(`  With images: ${withImages}`);
console.log(`  Without images: ${data.length - withImages}`);

// Category breakdown
const categories = {};
data.forEach(m => {
  const c = m.category || "NONE";
  categories[c] = (categories[c] || 0) + 1;
});
console.log("\n=== CATEGORIES ===");
Object.entries(categories)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, count]) => console.log(`  ${count}\t${name}`));

// Sample product names for common types
const types = ["SYRINGE", "SY", "TAB", "CAP", "CREAM", "GEL", "OINT", "GAUZE", "BANDAGE", "FORCEP", "SCISSOR", "NEEDLE", "MASK", "GLOVE", "COTTON"];
console.log("\n=== PRODUCT TYPE COUNTS (by name keyword) ===");
types.forEach(t => {
  const count = data.filter(m => m.name.toUpperCase().includes(t)).length;
  console.log(`  ${count}\t${t}`);
});

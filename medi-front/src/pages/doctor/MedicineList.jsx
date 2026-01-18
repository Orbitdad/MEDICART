import React, { useEffect, useState } from "react";
import { getMedicines } from "../../api/medicines.js";
import MedicineCard from "../../components/MedicineCard.jsx";
import CartFloatingButton from "../../components/CartFloatingButton.jsx";
import "./MedicineList.css";

const CATEGORY_MAP = [
  { code: "ALL", label: "All" },
  { code: "SYP", label: "Syrups" },
  { code: "TAB", label: "Tablets" },
  { code: "CAP", label: "Capsules" },
  { code: "E/E", label: "Eye / Ear" },
  { code: "INJ", label: "Injections" },
  { code: "INSTR", label: "Instruments" },
];

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     FETCH
  ------------------------------ */
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await getMedicines(search.trim());
      const filtered =
        activeCategory === "ALL"
          ? data
          : data.filter((m) => m.category === activeCategory);

      setMedicines(Array.isArray(filtered) ? filtered : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search, activeCategory]);

  return (
    <>
      <div className="medicine-page">
        {/* HEADER */}
        <div className="medicine-header">
          <h1>Medicine Catalog</h1>
          <p>Select category and add medicines</p>
        </div>

        {/* SEARCH */}
        <div className="medicine-search sticky-search">
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CATEGORIES */}
        <div className="medicine-categories">
          {CATEGORY_MAP.map((cat) => (
            <button
              key={cat.code}
              className={
                activeCategory === cat.code
                  ? "cat active"
                  : "cat"
              }
              onClick={() => setActiveCategory(cat.code)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="medicine-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="medicine-card skeleton-card" />
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <div className="medicine-empty">
            <p>No medicines found.</p>
            <p className="text-muted text-sm mt-1">
              Try adjusting search or category.
            </p>
          </div>
        ) : (
          <div className="medicine-grid">
            {medicines.map((med) => (
              <MedicineCard key={med._id} med={med} />
            ))}
          </div>
        )}
      </div>

      {/* FLOATING CART CTA */}
      <CartFloatingButton />
    </>
  );
}

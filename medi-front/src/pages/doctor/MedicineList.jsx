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
  { code: "EE", label: "Eye / Ear" },
  { code: "INJ", label: "Injections" },
  { code: "INSTR", label: "Instruments" },
];

export default function MedicineList() {
  const [allMedicines, setAllMedicines] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH ONCE
  ========================== */
  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      try {
        const data = await getMedicines();
        setAllMedicines(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  /* =========================
     FILTER LOCALLY
  ========================== */
useEffect(() => {
  let filtered = [...allMedicines];

  // SEARCH FILTER
  if (search.trim()) {
    const keyword = search.toLowerCase();

    filtered = filtered.filter((m) => {
      const searchableText = `
        ${m.name || ""}
        ${m.brand || ""}
        ${m.description || ""}
        ${m.packaging || ""}
      `.toLowerCase();

      return searchableText.includes(keyword);
    });
  }

  // CATEGORY FILTER
  if (activeCategory !== "ALL") {
    filtered = filtered.filter(
      (m) => m.category === activeCategory
    );
  }

  setMedicines(filtered);
}, [search, activeCategory, allMedicines]);


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
          </div>
        ) : (
          <div className="medicine-grid">
            {medicines.map((med) => (
              <MedicineCard key={med._id} med={med} />
            ))}
          </div>
        )}
      </div>

      <CartFloatingButton />
    </>
  );
}

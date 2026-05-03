import React, { useState, useEffect } from "react";
import { Search, Plus, Save, Loader2, Image as ImageIcon } from "lucide-react";
import { processAutoImage } from "../../utils/AutoImage.js";

const base = (import.meta.env.VITE_API_URL || "https://medicart-d2ju.onrender.com/api").replace(/\/$/, "");

export default function SmartRestock() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  
  // Batch details
  const [formData, setFormData] = useState({
    batch: "",
    qty: "",
    exp: "",
    mrp: "",
    price: ""
  });
  
  // AutoImage state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageProgress, setImageProgress] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    
    const delay = setTimeout(async () => {
      setSearching(true);
      try {
        const token = localStorage.getItem("medicart_token");
        const res = await fetch(`${base}/admin/ocr/search-medicine?q=${encodeURIComponent(query)}`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setSearching(false);
      }
    }, 400);
    
    return () => clearTimeout(delay);
  }, [query]);

  const selectMedicine = (med) => {
    setSelectedMedicine(med);
    setQuery("");
    setResults([]);
    setFormData({ batch: "", qty: "", exp: "", mrp: med.latestMrp || med.mrp || "", price: med.salePrice || "" });
    setImageFile(null);
    setImagePreview(med.images?.[0] || null);
    setMessage("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setProcessingImage(true);
    setImageProgress("Starting...");
    
    try {
      const result = await processAutoImage(file, (msg, pct) => {
        setImageProgress(`${msg} ${pct}%`);
      });
      setImageFile(result.file);
      setImagePreview(result.previewUrl);
    } catch (err) {
      alert("Failed to process image: " + err.message);
    } finally {
      setProcessingImage(false);
      setImageProgress("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    
    setSaving(true);
    setMessage("");
    
    try {
      const form = new FormData();
      form.append("purchaseNo", `RST-${Date.now()}`);
      form.append("purchaseType", "CASH PURCHASE");
      
      const item = {
        medicineId: selectedMedicine._id,
        itemName: selectedMedicine.name,
        mfr: selectedMedicine.brand,
        pkg: selectedMedicine.packaging,
        hsnCode: selectedMedicine.hsnCode,
        gstPercent: selectedMedicine.gstPercent,
        batch: formData.batch,
        exp: formData.exp,
        qty: Number(formData.qty),
        mrp: Number(formData.mrp),
        billRate: Number(formData.price),
        salePrice: Number(formData.price),
        isNewMedicine: false,
        matchConfidence: 1
      };
      
      form.append("items", JSON.stringify([item]));
      
      if (imageFile) {
        form.append("image_0", imageFile);
      }
      
      const token = localStorage.getItem("medicart_token");
      const res = await fetch(`${base}/admin/purchases`, {
        method: "POST",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: form
      });
      
      if (!res.ok) throw new Error("Failed to save restock");
      
      setMessage("Restock saved successfully!");
      // Reset form but keep medicine selected
      setFormData({ batch: "", qty: "", exp: "", mrp: selectedMedicine.latestMrp || selectedMedicine.mrp || "", price: selectedMedicine.salePrice || "" });
      setImageFile(null);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SEARCH SECTION */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Smart Restock</h2>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 p-3 bg-white/5 border border-white/10 rounded text-white focus:border-blue-500 outline-none"
            placeholder="Search medicine by name, brand, or alias..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && <Loader2 className="absolute right-3 top-3 h-5 w-5 text-gray-400 animate-spin" />}
        </div>
        
        {results.length > 0 && (
          <div className="mt-2 border border-white/10 rounded bg-[#1A1A24] overflow-hidden">
            {results.map(med => (
              <div 
                key={med._id} 
                onClick={() => selectMedicine(med)}
                className="p-3 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
              >
                <div>
                  <div className="font-medium text-white">{med.name}</div>
                  <div className="text-xs text-gray-400">{med.brand} • {med.packaging}</div>
                </div>
                <div className="text-xs text-blue-400">Select</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESTOCK FORM */}
      {selectedMedicine && (
        <form onSubmit={handleSave} className="card">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Image processing */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="w-full aspect-square bg-white/5 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center overflow-hidden relative mb-3">
                {imagePreview ? (
                  <img src={imagePreview} alt="Medicine" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-500" />
                )}
                {processingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
                    <Loader2 className="h-8 w-8 text-blue-400 animate-spin mb-2" />
                    <span className="text-xs text-white">{imageProgress}</span>
                  </div>
                )}
              </div>
              
              <input 
                type="file" 
                id="autoimage" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={processingImage || saving}
              />
              <label 
                htmlFor="autoimage" 
                className={`button button-sm button-outline w-full text-center ${processingImage ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {processingImage ? "Processing..." : "Take Photo (AutoImage)"}
              </label>
            </div>
            
            {/* Details */}
            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{selectedMedicine.name}</h3>
                <p className="text-sm text-gray-400">{selectedMedicine.brand} • {selectedMedicine.packaging}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Batch Number</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full p-2 bg-white/5 border border-white/10 rounded text-white" 
                    value={formData.batch} 
                    onChange={e => setFormData({...formData, batch: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Expiry (MM/YY)</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="12/26"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded text-white" 
                    value={formData.exp} 
                    onChange={e => setFormData({...formData, exp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quantity</label>
                  <input 
                    required 
                    type="number" 
                    min="1"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded text-white" 
                    value={formData.qty} 
                    onChange={e => setFormData({...formData, qty: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">MRP (₹)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded text-white" 
                    value={formData.mrp} 
                    onChange={e => setFormData({...formData, mrp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Purchase Price (₹)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    className="w-full p-2 bg-white/5 border border-white/10 rounded text-white" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className={message.includes("Error") ? "text-red-400" : "text-green-400"}>
                  {message}
                </div>
                <button 
                  type="submit" 
                  disabled={saving || processingImage}
                  className="button button-primary flex items-center justify-center gap-2 w-full md:w-auto"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Restock"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");

  /* ============================
     ADD TO CART
  ============================ */
  const addToCart = (medicine) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it._id === medicine._id
      );

      if (existing) return prev;

      return [
        ...prev,
        { ...medicine, quantity: "1" },
      ];
    });
  };

  /* ============================
     REMOVE
  ============================ */
  const removeFromCart = (id) => {
    setItems((prev) =>
      prev.filter((it) => it._id !== id)
    );
  };

  /* ============================
     UPDATE QTY (SAFE)
  ============================ */
  const updateQty = (id, quantity) => {
    setItems((prev) =>
      prev.map((it) =>
        it._id === id
          ? {
              ...it,
              quantity:
                quantity === ""
                  ? ""
                  : Math.min(
                      Number(quantity),
                      it.stock
                    ),
            }
          : it
      )
    );
  };

  /* ============================
     CLEAR CART
  ============================ */
  const clearCart = () => {
    setItems([]);
    setNotes("");
  };

  /* ============================
     TAXABLE AMOUNT
  ============================ */
  const taxableAmount = useMemo(() => {
    return items.reduce(
      (sum, it) =>
        sum +
        (Number(it.price) || 0) *
          (Number(it.quantity) || 0),
      0
    );
  }, [items]);

  /* ============================
     GST CALCULATION
  ============================ */
  const gstSummary = useMemo(() => {
    let cgst = 0;
    let sgst = 0;

    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      const gstPercent =
        Number(it.gstPercent) || 0;

      const amount = qty * price;
      const gst = (amount * gstPercent) / 100;

      cgst += gst / 2;
      sgst += gst / 2;
    });

    return {
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      totalGST: (cgst + sgst).toFixed(2),
    };
  }, [items]);

  /* ============================
     FINAL AMOUNT
  ============================ */
  const finalAmount = useMemo(() => {
    return (
      taxableAmount +
      Number(gstSummary.totalGST)
    ).toFixed(2);
  }, [taxableAmount, gstSummary]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,

        // existing
        notes,
        setNotes,

        // invoice
        taxableAmount: taxableAmount.toFixed(2),
        cgst: gstSummary.cgst,
        sgst: gstSummary.sgst,
        finalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

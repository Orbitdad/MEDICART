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
     (START EMPTY)
  ============================ */
  const addToCart = (medicine) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it._id === medicine._id
      );

      if (existing) return prev;

      return [
        ...prev,
        { ...medicine, quantity: "" },
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
     UPDATE QTY (NO FORCING)
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
     CLEAR
  ============================ */
  const clearCart = () => {
    setItems([]);
    setNotes("");
  };

  /* ============================
     TOTAL AMOUNT (SAFE)
  ============================ */
  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, it) =>
          sum +
          (Number(it.price) || 0) *
            (Number(it.quantity) || 0),
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalAmount,
        notes,
        setNotes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

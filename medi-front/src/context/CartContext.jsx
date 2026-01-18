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

  const addToCart = (medicine) => {
    setItems((prev) => {
      const existing = prev.find(
        (it) => it._id === medicine._id
      );

      if (existing) {
        if (existing.quantity >= medicine.stock) return prev;

        return prev.map((it) =>
          it._id === medicine._id
            ? { ...it, quantity: it.quantity + 1 }
            : it
        );
      }

      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((it) => it._id !== id));
  };

  const updateQty = (id, quantity) => {
    setItems((prev) =>
      prev.map((it) =>
        it._id === id
          ? {
              ...it,
              quantity: Math.max(
                1,
                Math.min(quantity, it.stock)
              ),
            }
          : it
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setNotes("");
  };

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, it) =>
          sum + (it.price || 0) * (it.quantity || 1),
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

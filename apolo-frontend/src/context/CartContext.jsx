import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCartData = (data) => {
    setItems(data.items || []);
    setSubtotal(data.subtotal || 0);
  };

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      applyCartData(data);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (variantId, quantity = 1) => {
    const data = await cartApi.addToCart(variantId, quantity);
    applyCartData(data);
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const data = await cartApi.updateCartItem(itemId, quantity);
    applyCartData(data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const data = await cartApi.removeCartItem(itemId);
    applyCartData(data);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, subtotal, itemCount, loading, addItem, updateItem, removeItem, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

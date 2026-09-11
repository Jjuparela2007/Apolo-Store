import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as wishlistApi from "../api/wishlist";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setItems(await wishlistApi.getWishlist());
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback((productId) => items.some((i) => i.product_id === productId), [items]);

  const toggleFavorite = useCallback(async (productId) => {
    const updated = isFavorite(productId)
      ? await wishlistApi.removeFromWishlist(productId)
      : await wishlistApi.addToWishlist(productId);
    setItems(updated);
  }, [isFavorite]);

  return (
    <WishlistContext.Provider value={{ items, isFavorite, toggleFavorite, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist debe usarse dentro de <WishlistProvider>");
  return ctx;
}

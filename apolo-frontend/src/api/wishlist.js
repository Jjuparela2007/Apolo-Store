import client from "./client";

export const getWishlist = () => client.get("/wishlist").then((r) => r.data.items);
export const addToWishlist = (productId) => client.post("/wishlist/items", { productId }).then((r) => r.data.items);
export const removeFromWishlist = (productId) => client.delete(`/wishlist/items/${productId}`).then((r) => r.data.items);

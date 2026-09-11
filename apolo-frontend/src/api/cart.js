import client from "./client";

export const getCart = () => client.get("/cart").then((r) => r.data);
export const addToCart = (variantId, quantity = 1) =>
  client.post("/cart/items", { variantId, quantity }).then((r) => r.data);
export const updateCartItem = (itemId, quantity) =>
  client.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data);
export const removeCartItem = (itemId) => client.delete(`/cart/items/${itemId}`).then((r) => r.data);

export const createOrder = (data) => client.post("/orders", data).then((r) => r.data.order);
export const getMyOrders = () => client.get("/orders").then((r) => r.data.orders);
export const getOrder = (id) => client.get(`/orders/${id}`).then((r) => r.data.order);

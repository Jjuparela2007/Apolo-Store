import client from "./client";

// Auth
export const adminLogin = (data) => client.post("/admin/auth/login", data).then((r) => r.data);
export const adminForgotPassword = (email) => client.post("/admin/auth/forgot-password", { email }).then((r) => r.data);

// Categorías
export const getCategories = () => client.get("/categories").then((r) => r.data.categories);
export const createCategory = (data) => client.post("/categories", data).then((r) => r.data.category);
export const updateCategory = (id, data) => client.put(`/categories/${id}`, data).then((r) => r.data.category);
export const deleteCategory = (id) => client.delete(`/categories/${id}`);

// Productos
export const getProducts = (params = {}) => client.get("/products", { params }).then((r) => r.data);
export const getProduct = (id) => client.get(`/products/${id}`).then((r) => r.data.product);
export const createProduct = (data) => client.post("/products", data).then((r) => r.data.product);
export const updateProduct = (id, data) => client.put(`/products/${id}`, data).then((r) => r.data.product);
export const deleteProduct = (id) => client.delete(`/products/${id}`);

export const addVariant = (productId, data) => client.post(`/products/${productId}/variants`, data).then((r) => r.data.variant);
export const updateVariant = (variantId, data) => client.put(`/products/variants/${variantId}`, data).then((r) => r.data.variant);
export const deleteVariant = (variantId) => client.delete(`/products/variants/${variantId}`);

export const uploadProductImages = (productId, files) => {
  const formData = new FormData();
  files.forEach((f) => formData.append("images", f));
  return client
    .post(`/products/${productId}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data.media);
};
export const deleteProductImage = (mediaId) => client.delete(`/products/images/${mediaId}`);

// Inventario
export const adjustStock = (data) => client.post("/admin/inventory/adjust", data).then((r) => r.data);
export const getLowStock = () => client.get("/admin/inventory/low-stock").then((r) => r.data.variants);

// Órdenes
export const getOrders = (params = {}) => client.get("/admin/orders", { params }).then((r) => r.data.orders);
export const getOrder = (id) => client.get(`/admin/orders/${id}`).then((r) => r.data.order);
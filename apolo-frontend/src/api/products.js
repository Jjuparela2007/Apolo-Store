import client from "./client";

export const getProducts = (params = {}) => client.get("/products", { params }).then((r) => r.data);
export const getProductBySlug = (slug) => client.get(`/products/slug/${slug}`).then((r) => r.data.product);
export const getCategories = () => client.get("/categories").then((r) => r.data.categories);

import client from "./client";

export const registerCustomer = (data) => client.post("/auth/register", data).then((r) => r.data);
export const loginCustomer = (data) => client.post("/auth/login", data).then((r) => r.data);
export const forgotPassword = (email) => client.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (data) => client.post("/auth/reset-password", data).then((r) => r.data);
export const getMyProfile = () => client.get("/auth/me").then((r) => r.data.customer);
export const updateMyProfile = (data) => client.put("/auth/me", data).then((r) => r.data);
export const changeMyPassword = (data) => client.put("/auth/change-password", data).then((r) => r.data);
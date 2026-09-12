import client from "./client";

export const getCheckoutSignature = (orderId) =>
  client.post("/payments/checkout-signature", { orderId }).then((r) => r.data);
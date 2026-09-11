const db = require("../config/db");

const Payment = {
  async create({ orderId, provider = "wompi", providerTxId, paymentMethod, status, amount, rawResponse }) {
    const [result] = await db.query(
      `INSERT INTO payments (order_id, provider, provider_tx_id, payment_method, status, amount, raw_response)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, provider, providerTxId, paymentMethod, status, amount, JSON.stringify(rawResponse || {})]
    );
    return result.insertId;
  },

  async findByProviderTxId(providerTxId, provider = "wompi") {
    const [[payment]] = await db.query(
      `SELECT * FROM payments WHERE provider = ? AND provider_tx_id = ?`,
      [provider, providerTxId]
    );
    return payment || null;
  },
};

module.exports = Payment;

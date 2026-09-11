const Cart = require("../models/Cart");
const { asyncHandler } = require("../middleware/error.middleware");
const { requireFields } = require("../middleware/validate.middleware");

// Todas estas rutas requieren sesión de cliente (ver cart.routes.js)

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getContents(req.customer.id);
  res.json(cart);
});

const addItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ["variantId"]);
  const { variantId, quantity } = req.body;
  const cart = await Cart.addItem(req.customer.id, { variantId, quantity: quantity || 1 });
  res.status(201).json(cart);
});

const updateItem = asyncHandler(async (req, res) => {
  requireFields(req.body, ["quantity"]);
  const cart = await Cart.updateItemQuantity(req.customer.id, req.params.itemId, Number(req.body.quantity));
  res.json(cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.removeItem(req.customer.id, req.params.itemId);
  res.json(cart);
});

module.exports = { getCart, addItem, updateItem, removeItem };

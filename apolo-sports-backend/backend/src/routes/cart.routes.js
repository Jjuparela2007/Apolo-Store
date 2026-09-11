const express = require("express");
const router = express.Router();
const { getCart, addItem, updateItem, removeItem } = require("../controllers/cart.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.use(requireCustomerAuth);

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);

module.exports = router;

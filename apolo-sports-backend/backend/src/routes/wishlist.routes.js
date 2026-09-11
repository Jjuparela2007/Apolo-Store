const express = require("express");
const router = express.Router();
const { getWishlist, addItem, removeItem } = require("../controllers/wishlist.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.use(requireCustomerAuth);

router.get("/", getWishlist);
router.post("/items", addItem);
router.delete("/items/:productId", removeItem);

module.exports = router;

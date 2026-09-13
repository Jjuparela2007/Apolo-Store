const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getMe, updateMe, changePassword } = require("../controllers/customerAuth.controller");
const { requireCustomerAuth } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireCustomerAuth, getMe);
router.put("/me", requireCustomerAuth, updateMe);
router.put("/change-password", requireCustomerAuth, changePassword);

module.exports = router;
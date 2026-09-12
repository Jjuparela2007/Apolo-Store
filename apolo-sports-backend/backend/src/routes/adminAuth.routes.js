const express = require("express");
const router = express.Router();
const { login, forgotPassword, resetPassword, getMe, updateMe, changePassword } = require("../controllers/adminAuth.controller");
const { requireAdminAuth } = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireAdminAuth, getMe);
router.put("/me", requireAdminAuth, updateMe);
router.put("/change-password", requireAdminAuth, changePassword);

module.exports = router;
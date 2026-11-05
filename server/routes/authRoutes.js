
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getAllUsers,
} = require("../controllers/authController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", register);

router.get("/verify-email/:token", verifyEmail);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", resetPassword);

// GET /api/auth/profile
router.get("/profile", protect, getProfile);

// GET /api/auth/admin/users
router.get("/admin/users", protect, adminOnly, getAllUsers);

module.exports = router;

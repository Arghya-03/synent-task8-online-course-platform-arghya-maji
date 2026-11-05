const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment,
    getMyEnrollments,
    getLearningCourse,
    completeLesson,
    getAllEnrollments,
} = require("../controllers/enrollmentController");

const {
    protect,
    adminOnly,
} = require("../middleware/authMiddleware");

// Admin: Get all student enrollments
router.get("/admin/all", protect, adminOnly, getAllEnrollments);

// Create Razorpay payment order
router.post("/create-order", protect, createOrder);

// Verify payment and complete enrollment
router.post("/verify-payment", protect, verifyPayment);

// Get logged-in student's completed enrollments
router.get("/my-enrollments", protect, getMyEnrollments);

// Get lessons of a purchased course
router.get("/:courseId/learning", protect, getLearningCourse);

// Mark a lesson as completed
router.post("/:courseId/complete-lesson", protect, completeLesson);

module.exports = router;
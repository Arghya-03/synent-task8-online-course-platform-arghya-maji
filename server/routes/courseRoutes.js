const express = require("express");
const router = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCoursesAdmin,
} = require("../controllers/courseController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

// Public: Get published courses
router.get("/", getCourses);

// Admin: Get all courses, including unpublished courses
router.get("/admin/all", protect, adminOnly, getAllCoursesAdmin);

// Public: Get one published course
router.get("/:id", getCourseById);

// Admin: Create a course
router.post("/", protect, adminOnly, createCourse);

// Admin: Update a course
router.put("/:id", protect, adminOnly, updateCourse);

// Admin: Delete a course
router.delete("/:id", protect, adminOnly, deleteCourse);

module.exports = router;
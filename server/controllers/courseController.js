
const Course = require("../models/Course");

// Get all published courses
exports.getCourses = async (req, res) => {
  try {
    const { search, category, level } = req.query;

    const filter = { isPublished: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (level) filter.level = level;

    const courses = await Course.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch courses",
    });
  }
};

// Get single course details
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch course",
    });
  }
};

// Admin: Create course
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error.message);
    res.status(400).json({
      success: false,
      message: "Unable to create course",
    });
  }
};

// Admin: Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update course",
    });
  }
};

// Admin: Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete course",
    });
  }
};

// Admin: Get all courses, including unpublished courses
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Admin get courses error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch all courses",
    });
  }
};
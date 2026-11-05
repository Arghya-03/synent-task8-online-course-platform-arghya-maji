
const Razorpay = require("razorpay");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Initialize Razorpay when an API request is received
const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay credentials are not configured");
    }

    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// Create Razorpay payment order
exports.createOrder = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            isPublished: true,
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
            paymentStatus: "completed",
        });

        if (existingEnrollment) {
            return res.status(409).json({
                success: false,
                message: "You are already enrolled in this course",
            });
        }

        const razorpay = getRazorpay();

        const order = await razorpay.orders.create({
            amount: Math.round(course.price * 100),
            currency: "INR",
            receipt: `sn_${Date.now()}`,
            notes: {
                studentId: String(req.user._id),
                courseId: String(course._id),
            },
        });

        res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Payment order error:", error);
        console.error("Error message:", error.message);
        console.error("Razorpay details:", error.error);

        res.status(500).json({
            success: false,
            message: "Unable to create payment order",
            error: error.message || "Unknown payment error",
        });
    }
};


const crypto = require("crypto");

// Verify Razorpay payment and complete enrollment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !courseId
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are required",
            });
        }

        const razorpay = getRazorpay();

        // Fetch the order from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id);

        // Verify that the order belongs to this student and course
        if (
            order.notes?.studentId !== String(req.user._id) ||
            order.notes?.courseId !== String(courseId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Payment order does not belong to this user or course",
            });
        }

        // Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const signatureBuffer = Buffer.from(razorpay_signature, "hex");
        const expectedBuffer = Buffer.from(expectedSignature, "hex");

        if (
            signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        // Confirm payment status directly with Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured" ||
            payment.amount !== order.amount ||
            payment.currency !== order.currency
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment is not captured or does not match the order",
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            isPublished: true,
        });

        if (!course || order.amount !== Math.round(course.price * 100)) {
            return res.status(400).json({
                success: false,
                message: "Course or payment amount is invalid",
            });
        }

        const existingEnrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
        });

        const isNewEnrollment =
            !existingEnrollment ||
            existingEnrollment.paymentStatus !== "completed";

        const enrollment = await Enrollment.findOneAndUpdate(
            {
                student: req.user._id,
                course: courseId,
            },
            {
                $set: {
                    paymentStatus: "completed",
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id,
                },
            },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true,
            }
        );

        // Send enrollment confirmation email only once
        if (isNewEnrollment) {
            try {
                const student = await User.findById(req.user._id);

                if (student) {
                    await sendEmail({
                        email: student.email,
                        subject: "Enrollment Successful - SkillNest",
                        html: `
                <h2>Congratulations, ${student.name}!</h2>

                <p>Your payment was successful and you are now enrolled in:</p>

                <h3>${course.title}</h3>

                <p><strong>Course Price:</strong> ₹${course.price}</p>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>

                <p>You can now access your course from your SkillNest Student Dashboard.</p>

                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
                   style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">
                    Go to Student Dashboard
                </a>

                <p>Thank you for learning with SkillNest!</p>
            `,
                    });
                }
            } catch (emailError) {
                console.error(
                    "Enrollment confirmation email error:",
                    emailError.message
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Payment verified and enrollment completed",
            enrollment,
        });
    } catch (error) {
        console.error("Payment verification error:", error.message);

        res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};


// Get all completed enrollments for the logged-in student
exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id,
            paymentStatus: "completed",
        })
            .populate({
                path: "course",
                select: "title description category thumbnail price level instructor modules",
            })
            .sort({ enrolledAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments,
        });
    } catch (error) {
        console.error("Fetch enrollments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch enrolled courses",
        });
    }
};


const mongoose = require("mongoose");

// Get a purchased course and its lessons
exports.getLearningCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
            paymentStatus: "completed",
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You must purchase this course to access its lessons",
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.status(200).json({
            success: true,
            course,
            enrollment,
        });
    } catch (error) {
        console.error("Learning course error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to load course lessons",
        });
    }
};


// Mark a lesson as completed
exports.completeLesson = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId } = req.body;

        if (
            !mongoose.isValidObjectId(courseId) ||
            !mongoose.isValidObjectId(lessonId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid course or lesson ID",
            });
        }

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: courseId,
            paymentStatus: "completed",
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course",
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Verify that the lesson belongs to this course
        const allLessons = course.modules.flatMap(
            (module) => module.lessons
        );

        const lessonExists = allLessons.some(
            (lesson) => String(lesson._id) === String(lessonId)
        );

        if (!lessonExists) {
            return res.status(404).json({
                success: false,
                message: "Lesson does not belong to this course",
            });
        }

        // Add the lesson only once
        const alreadyCompleted = enrollment.completedLessons.some(
            (id) => String(id) === String(lessonId)
        );

        if (!alreadyCompleted) {
            enrollment.completedLessons.push(lessonId);
        }

        // Calculate progress using the actual course lesson count
        const totalLessons = allLessons.length;

        enrollment.progress = totalLessons
            ? Math.round(
                (enrollment.completedLessons.length / totalLessons) * 100
            )
            : 0;

        await enrollment.save();

        res.status(200).json({
            success: true,
            message: "Lesson progress updated successfully",
            enrollment,
        });
    } catch (error) {
        console.error("Complete lesson error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update lesson progress",
        });
    }
};

// Admin: Get all student enrollments
exports.getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate({
                path: "student",
                select: "name email role",
            })
            .populate({
                path: "course",
                select: "title price category",
            })
            .sort({ enrolledAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments,
        });
    } catch (error) {
        console.error("Admin fetch enrollments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch all enrollments",
        });
    }
};
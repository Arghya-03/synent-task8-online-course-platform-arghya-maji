
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      default: "",
    },
    orderId: {
      type: String,
      default: "",
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

module.exports = mongoose.model("Enrollment", enrollmentSchema);

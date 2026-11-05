
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to SkillNest database");

    const adminName = "SkillNest Admin";
    const adminEmail = "admin@skillnest.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 12) {
      throw new Error(
        "Set ADMIN_PASSWORD in .env with at least 12 characters."
      );
    }

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
    });

    console.log("Admin account created successfully!");
    console.log("Admin email:", admin.email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();


const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function askPassword() {
  return await ask("Enter new admin password: ");
}

async function createAdmin() {
  try {
    await connectDB();

    const name = "SkillNest Admin";
    const email = (await ask("Enter admin email: "))
      .trim()
      .toLowerCase();

    const password = await askPassword();

    if (!email || password.length < 8) {
      throw new Error("Email is required and password must be at least 8 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let admin = await User.findOne({ email });

    if (admin) {
      admin.name = name;
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isEmailVerified = true;
      await admin.save();

      console.log("Existing account updated to admin successfully.");
    } else {
      admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true,
      });

      console.log("New admin account created successfully.");
    }

    console.log("Admin email:", admin.email);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("Admin setup error:", error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();


const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register user and send email verification link
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate a secure verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Create user with unverified email
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ),
    });

    const verificationURL = `${process.env.CLIENT_URL || "http://localhost:5173"
      }/verify-email/${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your SkillNest Email",
        html: `
          <h2>Welcome to SkillNest, ${user.name}!</h2>
          <p>Thank you for registering.</p>
          <p>Please verify your email address by clicking below:</p>
          <a href="${verificationURL}"
             style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">
            Verify Email Address
          </a>
          <p>This verification link expires in 24 hours.</p>
          <p>If you did not create this account, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError.message);

      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Unable to send verification email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in. Check your inbox.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


// Get logged-in user profile
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        enrolledCourses: req.user.enrolledCourses,
      },
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    // Use the same response whether the account exists or not.
    const successMessage =
      "If an account exists with this email, a password reset link will be sent.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMessage,
      });
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token in MongoDB.
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Link expires after 15 minutes.
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetURL = `${process.env.CLIENT_URL || "http://localhost:5173"
      }/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "SkillNest Password Reset",
        html: `
          <h2>Reset Your SkillNest Password</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password.</p>
          <p>Click the button below to create a new password:</p>
          <a href="${resetURL}"
             style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Password reset email error:", emailError.message);

      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    // Hash the token received from the reset link.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or expired",
      });
    }

    // Hash the new password.
    user.password = await bcrypt.hash(password, 12);

    // Invalidate the reset token after successful use.
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Verification link is invalid or expired.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify email. Please try again.",
    });
  }
};

// Admin: Get all registered users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin fetch users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch registered users.",
    });
  }
};
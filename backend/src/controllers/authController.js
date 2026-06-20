import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { sendApprovalEmailToAdmin, sendRegistrationPendingEmailToStudent, sendPasswordResetEmail } from "../utils/email.js";
import { validateObjectId } from "../utils/validation.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("classId", "standardName batch batchName");
    
    console.log("Login Attempt for:", email);
    if (!user) {
      console.log("DEBUG: User not found in database.");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("DEBUG: Password match result:", match);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "student" && !user.isApproved) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "",
        studentId: user.studentId || "",
        parentName: user.parentName || "",
        parentPhone: user.parentPhone || "",
        classId: user.classId || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error while logging in" });
  }
};

export const registerByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, phone, classId } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      classId: role === "student" ? validateObjectId(classId) : null,
      isApproved: true,
    });

    const populated = await User.findById(user._id).populate("classId", "standardName batch batchName");

    res.status(201).json({
      message: "User created successfully",
      user: populated,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error while creating user" });
  }
};

export const register = async (req, res) => {
  console.log(">>>> REGISTER TRIGGERED for:", req.body.email);
  try {
    const { name, email, password, phone, classId } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      classId: validateObjectId(classId),
      isApproved: false,
    });

    // Send emails
    await sendApprovalEmailToAdmin(user.name, user.email, user._id);
    await sendRegistrationPendingEmailToStudent(user.name, user.email);

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Self register error:", error);
    res.status(500).json({ message: "Server error while registering" });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(user.name, user.email, resetUrl);

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error while sending reset email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password has been successfully reset. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error while resetting password." });
  }
};
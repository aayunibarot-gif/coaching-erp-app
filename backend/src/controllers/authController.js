import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendApprovalEmailToAdmin } from "../utils/email.js";
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

    // Send email to admin
    await sendApprovalEmailToAdmin(user.name, user.email);

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
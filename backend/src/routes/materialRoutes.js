import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  uploadMaterial,
  getMaterialsByClass,
  getAllMaterials,
  deleteMaterial,
} from "../controllers/materialController.js";
import { protect, teacherOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File Filter (Only PDFs)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
router.get("/all", protect, getAllMaterials);
router.get("/class/:classId", protect, getMaterialsByClass);

router.post("/", protect, teacherOnly, upload.single("pdf"), uploadMaterial);
router.delete("/:id", protect, deleteMaterial);

export default router;

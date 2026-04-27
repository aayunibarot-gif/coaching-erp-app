import express from "express";
import { getStudentResult } from "../controllers/resultController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:studentId", protect, getStudentResult);

export default router;

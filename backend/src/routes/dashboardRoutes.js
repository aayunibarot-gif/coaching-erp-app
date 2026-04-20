import express from "express";
import { getAdminDashboard, getStudentDashboard, getTeacherDashboard } from "../controllers/dashboardController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, authorize("admin"), getAdminDashboard);
router.get("/teacher", protect, authorize("teacher"), getTeacherDashboard);
router.get("/student", protect, authorize("student", "parent"), getStudentDashboard);

export default router;

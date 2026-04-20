import express from "express";
import { getAttendanceSummary, markAttendance } from "../controllers/attendanceController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAttendanceSummary);
router.post("/", protect, authorize("teacher", "admin"), markAttendance);

export default router;

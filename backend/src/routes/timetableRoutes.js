import express from "express";
import { deleteTimetableDay, listTimetable, createTimetable, updateTimetable } from "../controllers/timetableController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listTimetable);
router.post("/", protect, authorize("admin", "teacher"), createTimetable);
router.put("/:id", protect, authorize("admin", "teacher"), updateTimetable);
router.delete("/:id", protect, authorize("admin", "teacher"), deleteTimetableDay);

export default router;

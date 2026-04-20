import express from "express";
import { deleteTimetableDay, listTimetable, upsertTimetable } from "../controllers/timetableController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listTimetable);
router.post("/", protect, authorize("admin", "teacher"), upsertTimetable);
router.delete("/:id", protect, authorize("admin", "teacher"), deleteTimetableDay);

export default router;

import express from "express";
import { createNotification, listNotifications } from "../controllers/notificationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listNotifications);
router.post("/", protect, authorize("admin", "teacher"), createNotification);

export default router;

import express from "express";
import { instituteAssistant } from "../controllers/assistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, instituteAssistant);

export default router;

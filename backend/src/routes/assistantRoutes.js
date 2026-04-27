import express from "express";
import { instituteAssistant } from "../controllers/assistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, instituteAssistant);
router.get("/status", (req, res) => {
  res.json({ 
    configured: !!process.env.GEMINI_API_KEY,
    keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + "..." : "none"
  });
});


export default router;

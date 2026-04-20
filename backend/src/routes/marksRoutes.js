import express from "express";
import { addMarks, getMarks, getPerformance } from "../controllers/marksController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMarks);
router.get("/performance", protect, getPerformance);
router.post("/", protect, authorize("teacher", "admin"), addMarks);

export default router;

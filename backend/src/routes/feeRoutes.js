import express from "express";
import { createFee, listFees, updateFee } from "../controllers/feesController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listFees);
router.post("/", protect, authorize("admin", "teacher"), createFee);
router.put("/:id", protect, authorize("admin", "teacher"), updateFee);

export default router;

import express from "express";
import { createRemark, listRemarks } from "../controllers/remarkController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listRemarks);
router.post("/", protect, authorize("teacher", "admin"), createRemark);

export default router;

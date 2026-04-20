import express from "express";
import { createClass, deleteClass, listClasses, updateClass } from "../controllers/classController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listClasses);
router.post("/", protect, authorize("admin"), createClass);
router.put("/:id", protect, authorize("admin"), updateClass);
router.delete("/:id", protect, authorize("admin"), deleteClass);

export default router;

import express from "express";
import { createSubject, deleteSubject, listSubjects, updateSubject } from "../controllers/subjectController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listSubjects);
router.post("/", protect, authorize("admin"), createSubject);
router.put("/:id", protect, authorize("admin"), updateSubject);
router.delete("/:id", protect, authorize("admin"), deleteSubject);

export default router;

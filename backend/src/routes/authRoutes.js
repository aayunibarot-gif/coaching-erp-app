import express from "express";
import { getMe, login, registerByAdmin, register } from "../controllers/authController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorize("admin"), registerByAdmin);
router.post("/self-register", register);
router.get("/me", protect, getMe);

export default router;
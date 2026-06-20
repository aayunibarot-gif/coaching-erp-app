import express from "express";
import { getMe, login, registerByAdmin, register, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, authorize("admin"), registerByAdmin);
router.post("/self-register", register);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", resetPassword);
router.get("/me", protect, getMe);

export default router;
import express from "express";
import {
  createUser,
  deleteUser,
  getStudentDetails,
  getUsers,
  updateUser,
  getPendingUsers,
  approveUser,
  approveDirect,
} from "../controllers/userController.js";
import { adminOnly, protect, teacherOrAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Special route for one-click approval from email (no protection needed as it uses a direct ID)
router.get("/approve-direct/:id", approveDirect);

router.get("/student/:id/details", protect, adminOnly, getStudentDetails);
router.get("/pending", protect, adminOnly, getPendingUsers);
router.put("/approve/:id", protect, adminOnly, approveUser);

router.route("/")
  .get(protect, teacherOrAdmin, getUsers)
  .post(protect, teacherOrAdmin, createUser);

router.route("/:id")
  .put(protect, teacherOrAdmin, updateUser)
  .delete(protect, teacherOrAdmin, deleteUser);

export default router;
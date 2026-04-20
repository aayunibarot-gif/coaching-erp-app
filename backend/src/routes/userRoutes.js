import express from "express";
import {
  createUser,
  deleteUser,
  getStudentDetails,
  getUsers,
  updateUser,
  getPendingUsers,
  approveUser,
} from "../controllers/userController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/student/:id/details", protect, adminOnly, getStudentDetails);
router.get("/pending", protect, adminOnly, getPendingUsers);
router.put("/:id/approve", protect, adminOnly, approveUser);

router.route("/")
  .get(protect, adminOnly, getUsers)
  .post(protect, adminOnly, createUser);

router.route("/:id")
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

export default router;
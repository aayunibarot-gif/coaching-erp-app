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
import { adminOnly, protect, teacherOrAdmin } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/student/:id/details", protect, adminOnly, getStudentDetails);
router.get("/pending", protect, adminOnly, getPendingUsers);
router.put("/:id/approve", protect, adminOnly, approveUser);

router.route("/")
  .get(protect, teacherOrAdmin, getUsers)
  .post(protect, teacherOrAdmin, createUser);

router.route("/:id")
  .put(protect, teacherOrAdmin, updateUser)
  .delete(protect, teacherOrAdmin, deleteUser);


export default router;
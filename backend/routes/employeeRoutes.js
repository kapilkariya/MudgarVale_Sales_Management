import express from "express";
import {
  getEmployeesWithStats,
  toggleVerify,
  toggleActive,
  updateEmployee,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, getEmployeesWithStats);
router.patch("/:id/verify", protect, adminOnly, toggleVerify);
router.patch("/:id/active", protect, adminOnly, toggleActive);
router.put("/:id", protect, adminOnly, updateEmployee);

export default router;
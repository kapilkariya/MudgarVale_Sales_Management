import express from "express";
import {
  createSale,
  getSales,
  deleteSale,
} from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  adminOnly,
  verifiedEmployeeOnly,
} from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, verifiedEmployeeOnly, createSale);
router.get("/", protect, getSales);
router.delete("/:id", protect, adminOnly, deleteSale);

export default router;
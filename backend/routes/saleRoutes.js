import express from "express";
import {
  createSale,
  getSales,
  updateSale,
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
router.put("/:id", protect, updateSale);
router.delete("/:id", protect, deleteSale);

export default router;
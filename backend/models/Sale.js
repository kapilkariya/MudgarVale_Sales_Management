import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      default: "kapil",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
    },
    weight: {
      type: String,
      required: [true, "Weight is required"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Delivery charge cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["COD", "Online"],
        message: "Payment method must be COD or Online",
      },
    },
    paidAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: [0, "Pending amount cannot be negative"],
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
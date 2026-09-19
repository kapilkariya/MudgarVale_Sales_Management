import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      enum: {
        values: ["mudgar", "gada", "samtola", "senaboard", "decor", "sticks"],
        message:
          "Category must be mudgar, gada, samtola, senaboard, decor, or sticks",
      },
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    weights: [
      {
        type: String,
        required: true,
      },
    ],
    pricePerWeight: {
      type: Map,
      of: Number,
      required: [true, "Price per weight is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("minPrice").get(function () {
  try {
    if (!this.pricePerWeight) return 0;

    const rawValues =
      typeof this.pricePerWeight.values === "function"
        ? Array.from(this.pricePerWeight.values())
        : Object.values(this.pricePerWeight);

    const nums = rawValues
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));

    return nums.length > 0 ? Math.min(...nums) : 0;
  } catch (err) {
    console.warn(
      `[Product] minPrice virtual failed for product ${this._id}:`,
      err.message
    );
    return 0;
  }
});

productSchema.virtual("priceDisplay").get(function () {
  try {
    const minPrice = this.minPrice;
    return `From Rs. ${Number(minPrice || 0).toLocaleString("en-IN")}`;
  } catch {
    return "From Rs. 0";
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
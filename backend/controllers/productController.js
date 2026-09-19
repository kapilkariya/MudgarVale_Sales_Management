import Product from "../models/Product.js";

// @desc    Get all active products (optionally filtered by category)
// @route   GET /api/products?category=mudgar
export const getProducts = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = String(req.query.category).toLowerCase();
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

// @desc    Get distinct categories (hardcoded list — matches Product enum)
// @route   GET /api/products/categories
export const getCategories = async (_req, res) => {
  const categories = ["mudgar", "gada", "samtola", "senaboard", "decor", "sticks"];
  res.status(200).json({ categories });
};
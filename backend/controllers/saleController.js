import Sale from "../models/Sale.js";
import Product from "../models/Product.js";

// @desc    Create a new sale (verified employee only)
// @route   POST /api/sales
export const createSale = async (req, res) => {
  try {
    const {
      productId,
      weight,
      sellingPrice,
      deliveryCharge,
      paymentMethod,
      paidAmount,
    } = req.body;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    if (!weight) return res.status(400).json({ message: "weight is required" });
    if (sellingPrice === undefined || sellingPrice === null)
      return res.status(400).json({ message: "sellingPrice is required" });
    if (!paymentMethod || !["COD", "Online"].includes(paymentMethod))
      return res.status(400).json({ message: "paymentMethod must be COD or Online" });

    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ message: "Product not found or inactive" });

    if (!product.weights.includes(String(weight)))
      return res
        .status(400)
        .json({ message: `Weight "${weight}" is not available for this product` });

    const sp = Number(sellingPrice);
    const dc = Number(deliveryCharge) || 0;
    const paid = Number(paidAmount) || 0;

    if (Number.isNaN(sp) || sp < 0)
      return res.status(400).json({ message: "Invalid sellingPrice" });
    if (Number.isNaN(dc) || dc < 0)
      return res.status(400).json({ message: "Invalid deliveryCharge" });
    if (Number.isNaN(paid) || paid < 0)
      return res.status(400).json({ message: "Invalid paidAmount" });

    const totalAmount = sp + dc;
    const pendingAmount = Math.max(totalAmount - paid, 0);

    const sale = await Sale.create({
      employee: req.user.id,
      employeeName: req.user.name,
      product: product._id,
      productName: product.name,
      category: product.category,
      weight: String(weight),
      sellingPrice: sp,
      deliveryCharge: dc,
      totalAmount,
      paymentMethod,
      paidAmount: paid,
      pendingAmount,
    });

    res.status(201).json({ message: "Sale created successfully", sale });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create sale", error: error.message });
  }
};

// @desc    Get sales. Employee → own sales only. Admin → all sales + filters.
// @route   GET /api/sales
export const getSales = async (req, res) => {
  try {
    const { employeeName, category, paymentMethod, from, to } = req.query;
    const filter = {};

    if (req.user.role === "employee") {
      filter.employeeName = req.user.name;
    } else if (employeeName) {
      filter.employeeName = employeeName;
    }

    if (category) filter.category = String(category).toLowerCase();
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: sales.length, sales });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales", error: error.message });
  }
};

// @desc    Delete a sale (admin only)
// @route   DELETE /api/sales/:id
// @desc    Delete a sale (employee deletes own; admin deletes any)
// @route   DELETE /api/sales/:id
export const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    if (req.user.role === "employee" && sale.employeeName !== req.user.name) {
      return res.status(403).json({ message: "Not your sale" });
    }

    await sale.deleteOne();
    res.status(200).json({ message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete sale", error: error.message });
  }
};

// @desc    Update an existing sale (employee edits their own; admin edits any)
// @route   PUT /api/sales/:id
export const updateSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    // Employee can only edit their own sale
    if (req.user.role === "employee" && sale.employeeName !== req.user.name) {
      return res.status(403).json({ message: "Not your sale" });
    }

    const { sellingPrice, deliveryCharge, paymentMethod, paidAmount } = req.body;

    const sp = sellingPrice !== undefined ? Number(sellingPrice) : sale.sellingPrice;
    const dc = deliveryCharge !== undefined ? Number(deliveryCharge) : sale.deliveryCharge;
    const paid = paidAmount !== undefined ? Number(paidAmount) : sale.paidAmount;
    const pm = paymentMethod !== undefined ? paymentMethod : sale.paymentMethod;

    if (Number.isNaN(sp) || sp < 0)
      return res.status(400).json({ message: "Invalid sellingPrice" });
    if (Number.isNaN(dc) || dc < 0)
      return res.status(400).json({ message: "Invalid deliveryCharge" });
    if (Number.isNaN(paid) || paid < 0)
      return res.status(400).json({ message: "Invalid paidAmount" });
    if (!["COD", "Online"].includes(pm))
      return res.status(400).json({ message: "Invalid paymentMethod" });

    sale.sellingPrice = sp;
    sale.deliveryCharge = dc;
    sale.paymentMethod = pm;
    sale.paidAmount = paid;
    sale.totalAmount = sp + dc;
    sale.pendingAmount = Math.max(sale.totalAmount - paid, 0);

    await sale.save();

    res.status(200).json({ message: "Sale updated", sale });
  } catch (error) {
    res.status(500).json({ message: "Failed to update sale", error: error.message });
  }
};
import Employee from "../models/Employee.js";
import Sale from "../models/Sale.js";

// @desc    List all employees with sales stats
// @route   GET /api/employees   (admin only)
export const getEmployeesWithStats = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    // Aggregate sales per employee
    const stats = await Sale.aggregate([
      {
        $group: {
          _id: "$employeeName",
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          totalPending: { $sum: "$pendingAmount" },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach((s) => {
      statsMap[s._id] = s;
    });

    const result = employees.map((e) => {
      const s = statsMap[e.name] || {};
      return {
        _id: e._id,
        name: e.name,
        username: e.username,
        isVerified: e.isVerified,
        isActive: e.isActive,
        createdAt: e.createdAt,
        totalSales: s.totalSales || 0,
        totalRevenue: s.totalRevenue || 0,
        totalPaid: s.totalPaid || 0,
        totalPending: s.totalPending || 0,
      };
    });

    res.status(200).json({ count: result.length, employees: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch employees", error: error.message });
  }
};

// @desc    Verify / unverify an employee
// @route   PATCH /api/employees/:id/verify
export const toggleVerify = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.isVerified = !employee.isVerified;
    await employee.save();

    res.status(200).json({
      message: `Employee ${employee.isVerified ? "verified" : "unverified"}`,
      employee: {
        _id: employee._id,
        isVerified: employee.isVerified,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update employee", error: error.message });
  }
};

// @desc    Activate / deactivate an employee
// @route   PATCH /api/employees/:id/active
export const toggleActive = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.isActive = !employee.isActive;
    await employee.save();

    res.status(200).json({
      message: `Employee ${employee.isActive ? "activated" : "deactivated"}`,
      employee: {
        _id: employee._id,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update employee", error: error.message });
  }
};

// @desc    Edit employee (name and/or password)
// @route   PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { name, password } = req.body;
    const employee = await Employee.findById(req.params.id).select("+password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (name) employee.name = name.trim();

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      const bcrypt = (await import("bcryptjs")).default;
      employee.password = await bcrypt.hash(password, 10);
    }

    await employee.save();
    res.status(200).json({ message: "Employee updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update employee", error: error.message });
  }
};
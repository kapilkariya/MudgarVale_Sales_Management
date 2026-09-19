import Employee from "../models/Employee.js";

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const employeeOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "employee") {
    return res.status(403).json({ message: "Employee access only" });
  }
  next();
};

export const verifiedEmployeeOnly = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "employee") {
      return res.status(403).json({ message: "Employee access only" });
    }

    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!employee.isActive) {
      return res.status(403).json({ message: "Your account is deactivated" });
    }
    if (!employee.isVerified) {
      return res
        .status(403)
        .json({ message: "Your account is pending admin approval" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Verification check failed" });
  }
};
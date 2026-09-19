import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import generateToken from "../utils/generateToken.js";

// @desc    Sign up a new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ message: "Name, username and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const cleanUsername = username.toLowerCase().trim();

    const existing = await Employee.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hash = await bcrypt.hash(password, 10);

    const adminUsername = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
    const isAdminUsername = adminUsername && cleanUsername === adminUsername;

    const employee = await Employee.create({
      name: name.trim(),
      username: cleanUsername,
      password: hash,
      isVerified: isAdminUsername ? true : false,
      isActive: true,
    });

    res.status(201).json({
      message: isAdminUsername
        ? "Admin account created. You can log in now."
        : "Account created. Please wait for admin approval.",
      user: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// @desc    Unified login
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const cleanUsername = username.toLowerCase().trim();

    const employee = await Employee.findOne({ username: cleanUsername }).select(
      "+password"
    );

    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!employee.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact admin." });
    }

    const match = await bcrypt.compare(password, employee.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const adminUsername = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
    const isAdmin = adminUsername && cleanUsername === adminUsername;
    const role = isAdmin ? "admin" : "employee";

    const token = generateToken({
      id: employee._id,
      role,
      name: employee.name,
      username: employee.username,
    });

    return res.status(200).json({
      token,
      user: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        role,
        isVerified: isAdmin ? true : employee.isVerified,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc    Get current logged-in user (fresh from DB every time)
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!employee.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    const adminUsername = (process.env.ADMIN_USERNAME || "").toLowerCase().trim();
    const isAdmin = adminUsername && employee.username === adminUsername;

    res.status(200).json({
      user: {
        id: employee._id,
        name: employee.name,
        username: employee.username,
        role: isAdmin ? "admin" : "employee",
        isVerified: isAdmin ? true : employee.isVerified,
        isActive: employee.isActive,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};
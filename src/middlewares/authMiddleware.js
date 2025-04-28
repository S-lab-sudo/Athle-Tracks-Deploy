const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AdminModel = require("../models/adminModel");
const { log } = require("../utils/logger");
const { verifyToken } = require("../utils/token");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const { valid, decoded } = verifyToken(token);
    if (!valid) {
      return res.status(400).json({ message: "Invalid token." });
    }
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: "Invalid token." });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const { valid, decoded } = verifyToken(token);
    if (!valid) {
      return res.status(400).json({ message: "Invalid token." });
    }
    req.admin = await AdminModel.findById(decoded.id);
    if (!req.admin) {
      return res.status(401).json({ message: "Invalid token." });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

const authenticateSuperAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
    .status(401)
    .json({ message: "Access denied. No token provided." });
  }
  try {
    const { valid, decoded } = verifyToken(token);
    if (!valid) {
      return res.status(400).json({ message: "Invalid token." });
    }
    if (decoded.id !== process.env.SUPERADMIN_ID) {
      return res.status(401).json({ message: "Invalid token." });
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = {
  authenticate,
  authenticateAdmin,
  authenticateSuperAdmin,
};

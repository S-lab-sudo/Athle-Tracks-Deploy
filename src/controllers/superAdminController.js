const SuperAdminModel = require("../models/superAdminModel");
const { generateToken, verifyToken } = require("../utils/token");
const AdminModel = require("../models/adminModel");
const { encryptPassword } = require("../utils/encrypt");
const { log } = require("../utils/logger");

const login = async (req, res) => {
  try {
    const { id, password } = req.body;
    if (
      id === process.env.SUPERADMIN_ID &&
      password === process.env.SUPERADMIN_PASSWORD
    ) {
      const token = generateToken(id, "4h");
      log("Super Admin logged in");

      const superAdmin = await SuperAdminModel.findOne();
      if (superAdmin) {
        superAdmin.logs.push({ action: "Super Admin logged in" });
        await superAdmin.save();
      } else {
        const newSuperAdmin = new SuperAdminModel({
          logs: [{ action: "Super Admin logged in" }],
        });
        await newSuperAdmin.save();
      }

      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const checkToken = (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const { valid, decoded, error } = verifyToken(token);
  if (valid && decoded.id === process.env.SUPERADMIN_ID) {
    res.status(200).json({ message: "Token is valid" });
  } else {
    if (error === "jwt expired") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(400).json({ message: "Invalid token" });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { username, password, email, phoneNumber } = req.body;
    const encryptedPassword = await encryptPassword(password);
    const admin = new AdminModel({
      username,
      password: encryptedPassword,
      email,
      phoneNumber,
    });
    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllAdmin = async (req, res) => {
  try {
    const admin = await AdminModel.find();
    res.status(200).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, email, phoneNumber } = req.body;
    const encryptedPassword = await encryptPassword(password);
    const admin = await AdminModel.findByIdAndUpdate(
      id,
      { username, password: encryptedPassword, email, phoneNumber },
      { new: true }
    );
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAdmin,
  getAllAdmin,
  login,
  checkToken,
  updateAdmin
};

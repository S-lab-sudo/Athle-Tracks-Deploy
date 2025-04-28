const { generateToken, verifyToken } = require("../utils/token");
const { comparePassword } = require("../utils/encrypt");
const TournamentModel = require("../models/tournamentModel");
const AdminModel = require("../models/adminModel");
const path = require('path');
const fs = require('fs');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(admin._id, '1d');
    res.status(200).json({ admin, token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const checkAdminToken = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const { valid, decoded } = verifyToken(token);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  res.status(200).json({ decoded });
};

module.exports = {
  login,
  checkAdminToken
};
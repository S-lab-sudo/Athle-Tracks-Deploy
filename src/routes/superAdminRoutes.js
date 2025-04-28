const express = require("express");
const { authenticateSuperAdmin } = require("../middlewares/authMiddleware");
const { checkToken,login,createAdmin,getAllAdmin,updateAdmin } = require("../controllers/superAdminController");
const router = express.Router();

router.post("/login", login);
router.get("/check-token", checkToken);
router.post("/create-admin", authenticateSuperAdmin, createAdmin);
router.get("/get-admins",authenticateSuperAdmin, getAllAdmin);
router.put("/update-admin/:id",authenticateSuperAdmin, updateAdmin);

module.exports = router;

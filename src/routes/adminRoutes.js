const express = require('express');
const {login,checkAdminToken} = require("../controllers/adminController");

const router = express.Router();

router.post('/login', login);
router.get('/check-token',checkAdminToken);

module.exports = router;
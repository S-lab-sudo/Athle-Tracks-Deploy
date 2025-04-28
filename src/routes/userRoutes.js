const express = require('express');
const {
    createUser,
    userLogin,
    getUser,
    updateUser,
    deleteUser,
    getAllUsers
} = require('../controllers/userController');

const router = express.Router();

// For Users
router.post('/signup', createUser);
router.post('/login', userLogin);


// For admin
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
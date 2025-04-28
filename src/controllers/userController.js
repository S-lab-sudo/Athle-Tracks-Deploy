const UserModel = require('../models/userModel');
const { encryptPassword, comparePassword } = require('../utils/encrypt');
const { generateToken, verifyToken } = require('../utils/token');
const {log}=require('../utils/logger');

const createUser = async (req, res) => {
    try {
        console.log(req.body)
        const { name, email, phoneNumber, password } = req.body;
        const existingUser = await UserModel.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const encryptedPassword = await encryptPassword(password);
        const user = new UserModel({
            name,
            email,
            phoneNumber,
            password: encryptedPassword,
            subscriptionPlan: {
                type: '0',
                startDate: new Date(0),
                endDate: new Date(0)
            }
        });
        await user.save();
        log(`User created: ${user._id}`);
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                subscriptionPlan: user.subscriptionPlan
            }
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
};

const userLogin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const user = await UserModel.findOne({ phoneNumber });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id, '7d');
        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500)
    }
};

const getUser = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, password, subscriptionPlan } = req.body;
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        if (password) {
            user.password = await encryptPassword(password);
        }
        user.subscriptionPlan = subscriptionPlan || user.subscriptionPlan;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllUsers = async(req, res) => {
    const users=await UserModel.find();
    if(!users){
        return res.status(404).json({message:'No users found'});
    }
    res.status(200).json(users);
};

module.exports = {
    createUser,
    userLogin,
    getUser,
    updateUser,
    deleteUser,
    getAllUsers
};
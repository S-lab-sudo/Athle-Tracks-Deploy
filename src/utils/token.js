const jwt = require('jsonwebtoken');

const generateToken = (id,expiresIn) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn
    });
};

const verifyToken = (token) => {
    try {
        return { valid: true, decoded: jwt.verify(token, process.env.JWT_SECRET) };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};

module.exports = {
    generateToken,
    verifyToken
};
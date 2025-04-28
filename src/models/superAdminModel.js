const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const superAdminSchema = new mongoose.Schema({
    logs: [logSchema]
});

const SuperAdminModel = mongoose.model('SuperAdmin', superAdminSchema);

module.exports = SuperAdminModel;
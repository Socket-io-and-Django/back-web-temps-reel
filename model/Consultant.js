
const mongoose = require("mongoose");

const {Schema} = require("mongoose");

const consultantSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    roles: {
        User: {
            type: Number,
            default: 42
        },
        Consultant: Number,
        Admin: Number
    },
    password: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    refreshToken: String
});


module.exports = mongoose.model('Consultant', consultantSchema);
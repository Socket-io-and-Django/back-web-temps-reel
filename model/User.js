
const mongoose = require("mongoose");

const {Schema} = require("mongoose");

const userSchema = new Schema({
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
        default: false
    },
    refreshToken: String
});


module.exports = mongoose.model('User', userSchema);
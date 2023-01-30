const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const chatRoomSchema = new Schema({
    roomName: {
        type: String,
        default: "Public Room"
    },
    capacity: {
        type: Number,
        default: 20
    },
    CreationDatetime: {
        type:Date,
        default: () => Date.now()
    },
    status: {
        type: Boolean,
        default: true
    }
});
module.exports = mongoose.model('Room', chatRoomSchema);
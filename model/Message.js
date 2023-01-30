const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const messageSchema = new Schema({
    username: String,
    text: String,
    creationDatetime: {
        type:Date,
        immutable: true,
        default: () => Date.now()
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },
});

module.exports = mongoose.model('Message', messageSchema);
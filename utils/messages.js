const Message = require('../model/Message');
// const Room = require("../model/Room");


async function createMessage(username, text, room) {
    try {
        // store new message
        const newMessage = await new Message({
            username,
            text,
            room
        })
        return await newMessage.save();
    }
    catch (err) {
        return null;
    }
}

// async function formatMessage(username, text, room, socket) {
//     const message = await createMessage(username, text, room);
//     const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec().then(
//         () => {
//             console.log("mes: ", message);
//              socket.emit('message' , messages);
//         });
// }
function welcomeMessage(username, text, room, socket) {
    // const message = await createMessage(username, text, room);
    socket.emit('message', [{
        username,
        text,
        creationDatetime: Date.now(),
        room
    }]);
}
async function askToChatMessage(id, username, text, room, io) {
    const message = await createMessage(username, text, room);
    const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec();
    await io.to(id).emit('message', messages);
}
async function acceptToChatMessage(username, text, room, socket) {
    const message = await createMessage(username, text, room);
    await socket.to(room).emit('message', [message]);
}
async function consultantRefuseToChaMessage(client_id, username, text, room, socket) {
    const message = await createMessage(username, text, room);
    const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec();
    await socket.to(client_id).emit('consultantRefuseToChat', messages);
}

async function leaveChatMessage(username, text, room, socket) {
    const message = await createMessage(username, text, room);
    const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec();
    await socket.to(room).emit('message', messages);
}
async function chatMessage(username, text, room, io) {
    console.log("in chatMessage: ", username, text, room);
    const message = await createMessage(username, text, room);
    const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec();
    await io.to(room).emit('message', messages);
}
async function leavingRoomMessage(username, text, room, socket) {
    const message = await createMessage(username, text, room);
    const messages = await Message.find({room: room}).limit(30).sort({CreationDatetime:-1}).exec();
    await socket.to(room).emit("chatMessage", messages);
}

module.exports = {
    welcomeMessage, askToChatMessage, acceptToChatMessage, consultantRefuseToChaMessage,
    leaveChatMessage, chatMessage, leavingRoomMessage
};
const Room = require('../model/Room');


async function createRoom(roomName) {
    const alreadyExist = await Room.findOne({room_id: roomName}).exec();
    // if room is already exist
    if (alreadyExist) {
        console.log("room details: ", alreadyExist.id, alreadyExist._id)
        return alreadyExist.id;
    }
    try {
        // store new room
        const newRoom = await new Room({
            roomName,
                members: [],
                chat_messages: [],
                CreationDatetime: new Date()
            })
        const result = await newRoom.save();
        return {
            roomName: newRoom.roomName,
            id: newRoom._id
        };
    }
    catch (err) {
        return null;
    }
}


async function getRoom(roomName){
    const isExistRoom = await Room.findOne({roomName: roomName}).exec();
    if(!isExistRoom) {
        return null;
    }
    return {
        roomName: isExistRoom.roomName,
        id: isExistRoom._id
    };
}
// async function getRoomChatMessages(room_id){
//     const isExistRoom = await Room.findOne({room_id: room_id}).populate("chat_messages").exec();
//     if(!isExistRoom) {
//         return [];
//     }
//     return isExistRoom.chat_messages;
// }

async function getRoomCapacity(roomName){
    const isExistRoom = await Room.findOne({roomName: roomName}).exec();
    if(!isExistRoom) {
        return -1;
    }
    return isExistRoom.capacity;
}

async function setRoomCapacity(roomName, newCapacity){
    const isExistRoom = await Room.findOne({roomName: roomName}).exec();
    if(!isExistRoom) {
        return -1;
    }
    isExistRoom.capacity = newCapacity;
    const result = await isExistRoom.save();
    return isExistRoom.capacity;
}

// async function insertMessage(message, room_id){
//
//     const isExistRoom = await Room.findOne({room_id: room_id}).populate('chat_messages').select('-username').exec();
//     if(!isExistRoom) {
//         return "";
//     }
//     isExistRoom.chat_messages.push(message);
//     console.log('resultss: ', isExistRoom.chat_messages);
//
//     const result = await isExistRoom.save();
//     console.log('results: ', isExistRoom.chat_messages);
//     return isExistRoom.chat_messages.slice(-30);
// }

module.exports = {createRoom, getRoom, setRoomCapacity, getRoomCapacity};
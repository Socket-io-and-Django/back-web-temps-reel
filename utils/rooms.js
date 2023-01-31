const Room = require('../model/Room');
const {chatMessage} = require("./messages");
const {getRoomUsers} = require("./users");
const BOTNAME = "BOT";

async function createRoom(roomName, roomPublic) {
    const alreadyExist = await Room.findOne({roomName: roomName}).exec();
    // if room is already exist
    if (alreadyExist) {
        console.log("room details: ", alreadyExist.id, alreadyExist._id)
        return alreadyExist.id;
    }
    try {
        // store new room
        const newRoom = await new Room({
            roomName: roomName,
            roomPublic: roomPublic,
            creationDatetime: new Date(),
            })
        const result = await newRoom.save();
        return newRoom.id;
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
    return isExistRoom.id;
}
// async function getRoomChatMessages(room_id){
//     const isExistRoom = await Room.findOne({room_id: room_id}).populate("chat_messages").exec();
//     if(!isExistRoom) {
//         return [];
//     }
//     return isExistRoom.chat_messages;
// }

async function getRoomCapacity(roomName){
    const isExistRoom = await Room.findOne({_id: roomName}).exec();
    if(!isExistRoom) {
        return -1;
    }
    return isExistRoom.capacity;
}

async function setRoomCapacity(roomId, newCapacity){
    const isExistRoom = await Room.findOne({_id: roomId}).exec();
    if(!isExistRoom) {
        return -1;
    }
    isExistRoom.capacity = newCapacity;
    const result = await isExistRoom.save();
    return isExistRoom.capacity;
}
async function setRoomName(roomId, newName){
    const isExistRoom = await Room.findOne({_id: roomId}).exec();
    if(!isExistRoom) {
        return -1;
    }
    isExistRoom.roomName = newName;
    const result = await isExistRoom.save();
    return isExistRoom.newName;
}

async function modifyRoom(roomId, newRoomName, newRoomCapacity){
    const capacity = setRoomCapacity(roomId, newRoomCapacity);
    const name = setRoomName(roomId, newRoomName)
    console.log("modifyRoom", capacity, name)
}

async function getAllRooms(io){
    const allRooms =  await Room.find({roomPublic: true}).exec();

    io.emit('getAllRooms', allRooms);
}
async function getActiveRooms(io){
    const activeRooms =  await Room.find({status: true, roomPublic: true}).exec();
    await io.emit('roomsList', activeRooms);
}


async function joinRoom(roomId, user,  socket){
    const isExistRoom = await Room.findOne({_id: roomId}).exec();
    console.log("in joinRoom ...", isExistRoom.id)
    if(!isExistRoom){
        await chatMessage(BOTNAME, `Room is not available`, user.room, socket);
        return;
    }
    const userRoomNumber = getRoomUsers(isExistRoom.id);
    if(userRoomNumber.length >= isExistRoom.capacity){
        await chatMessage(BOTNAME, `Room: ${isExistRoom.roomName} is already full`, user.room, socket);
        return;
    }
    user.room = isExistRoom.id;
    socket.join(user.room);
    // console.log("join: ", user.room, isExistRoom.roomName)

    await chatMessage(BOTNAME, `${isExistRoom.roomName} welcome back`, user.room, socket);
    await getActiveRooms(socket);
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

module.exports = {
    createRoom, getRoom, setRoomCapacity, getActiveRooms,
    getRoomCapacity, getAllRooms, joinRoom, modifyRoom};
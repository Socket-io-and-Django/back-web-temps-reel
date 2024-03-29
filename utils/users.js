const {rolesList} = require('../config/rolesList');
const formatMessage = require("./messages");
const onlineUsersList = [];

function consultantNotAvailable(io, socket, consultant, PUBLIC_ROOM_ID) {
    if(consultant && consultant.hasOwnProperty('waitingList')){
        consultant.waitingList.forEach(client => {
            io.to(client.id).socketsLeave(client.room);
            client.room = PUBLIC_ROOM_ID;
            io.to(client.id).socketsJoin(client.room);
            socket.to(client.id).emit('consultantRefuseToChat', formatMessage('', `${consultant.username} is no more available`));

        })
        consultant.waitingList = []
    }
    socket.emit("waitingList", getWaitingList(consultant.id))
}


function isConsultant(roles) {
    return roles.includes(rolesList.Consultant);
}
// join user to chat
function getConsultants() {
    const available =  onlineUsersList.filter(user => isConsultant(user.roles) === true && user.isAvailable);
    return available;
}
function userJoin(id, username, roles, room) {
    const user = {id, username, roles, room};

    if(isConsultant(user.roles)) {
        user.isAvailable = true;
        user.waitingList = [];
    }
    onlineUsersList.push(user);
    return user;
}

// get user from id
function getUser(id) {
    return onlineUsersList.find(user => user.id === id);
}

function getUserByName(username) {
    return onlineUsersList.find(user => user.username === username);
}

// user leave chat
function userLeave(id) {
    const index = onlineUsersList.findIndex(user => user.id === id);
    if(index !== -1) {
        return onlineUsersList.splice(index, 1)[0];
    }
}
// get room users
function getRoomUsers(room) {
    return onlineUsersList.filter(user => user.room === room);
}



function getConsultantsAvailable() {
    return onlineUsersList.filter(user => (isConsultant(user.roles) && user.available) );
}

function getOnlineUsers() {
    return onlineUsersList;
}

function getWaitingList(id){
    const consultant = getUser(id);
    if (isConsultant(consultant.roles)){
        return consultant.waitingList;
    }
    return []
}
function addToWaitingList(id, user){
    const consultant = getUser(id);
    if (isConsultant(consultant.roles)){
        consultant.waitingList.push(user);
    }
}

function logoutOnlineUsersList(id){
    if(id){
        const index = onlineUsersList.findIndex(user => user.id === id);
        if(index !== -1) {
            const result =  onlineUsersList.splice(index, 1)[0];
        }
    }
}

function leaveWaitingList(id, user){
    if(user && user.hasOwnProperty('waitingList')){
        const index = user.waitingList.findIndex(client => client.id === id);
        if(index !== -1) {
            return user.waitingList.splice(index, 1)[0];
        }
    }
}

module.exports= {
    userJoin,
    getUser,
    userLeave,
    getRoomUsers,
    getConsultants,
    getUserByName,
    getOnlineUsers,
    addToWaitingList,
    getWaitingList,
    isConsultant,
    leaveWaitingList,
    consultantNotAvailable,
    logoutOnlineUsersList,
    onlineUsersList
}
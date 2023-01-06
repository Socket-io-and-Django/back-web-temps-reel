const {rolesList} = require('../config/rolesList');
const onlineUsersList = [];
const onlineConsultantList = [];
const waitingList = [];


function isConsultant(roles) {
    return roles.includes(rolesList.Consultant);
}
// join user to chat
function getConsultants() {
    return onlineUsersList.filter(user => isConsultant(user.roles) === true);
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

// get current user
function getCurrentUser(id) {
    return onlineUsersList.find(user => user.id === id);
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
    // const waitingList = [];
    // getCurrentUser(id).waitingList.forEach(client => {
    //     waitingList.push(client);
    // });
    // return waitingList;
    const consultant = getCurrentUser(id);
    if (isConsultant(consultant.roles)){
        return consultant.waitingList;
    }
    return []
}
function addToWaitingList(id, user){
    const consultant = getCurrentUser(id);
    if (isConsultant(consultant.roles)){
        consultant.waitingList.push(user);
    }
}

function leaveWaitingList(id, user){
    const index = user.waitingList.findIndex(client => client.id === id);
    if(index !== -1) {
        return user.waitingList.splice(index, 1)[0];
    }
}

module.exports= {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getConsultants,
    getOnlineUsers,
    addToWaitingList,
    getWaitingList,
    isConsultant,
    leaveWaitingList
}
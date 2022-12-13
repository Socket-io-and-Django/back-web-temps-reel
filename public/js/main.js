//const socketIoClient = require('socket.io-client');

const chatForm = document.getElementById('chat-form')

const queryString = window.location.search;
const urlParam = new URLSearchParams(queryString)
const userName = urlParam.get('username')
const room = urlParam.get('room')
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');
// console.log(userName, room);


const socket = io();
io.connect()

// join chat room
socket.emit('joinRoom', {userName, room})
const chatMessages = document.querySelector('.chat-messages');

// get room and users info
socket.on('roomUsers', ({room, users}) => {
    outputRoom(room);
    outputUsers(users);
});

// message from server
socket.on('message', message => {
    // console.log(message);
    messageHandler(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// message submit
chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get message text
        const message = e.target.elements.namedItem('msg').value;

        // Emit message to server
        socket.emit('chatMessage', message);

        // clear chat input
        e.target.elements.namedItem('msg').value = '';
        e.target.elements.namedItem('msg').focus();
    });

// handling message on DOM
function messageHandler(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML =`<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add room name to DOM
function outputRoom(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    usersList.innerHTML=`${users.map(user => `<li>${user.username}</li>`).join('')}`;
}
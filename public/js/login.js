//
// const chatForm = document.getElementById('chat-form');
// const roomName = document.getElementById('room-name');
// const usersList = document.getElementById('users');


//
//
// // handling message on DOM
// function messageHandler(message) {
//     const div = document.createElement('div');
//     div.classList.add('message');
//     div.innerHTML =`<p class="meta">${message.username} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
//     document.querySelector('.chat-messages').appendChild(div);
// }
//
// // add room name to DOM
// function outputRoom(room) {
//     roomName.innerText = room;
// }
//
// // add users to DOM
// function outputUsers(users) {
//     usersList.innerHTML=`${users.map(user => `<li>${user.username}</li>`).join('')}`;
// }

// import {io} from "socket.io-client";
// import { parse } from "cookie";

// const COOKIE_NAME = "jwt";
function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const user = {
        "username": data.get('user-name'),
        "password": data.get('password')
    }
    // console.log(`user: ${user}`);


    async function postData(url = '', data = {}) {
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }
    postData('http://localhost:3000/auth', user)
        .then((data) => {
            // const cookie = document.cookie;
            // console.log("coockie:", cookie);
            if(data.accessToken) {
                const accessToken = data.accessToken;
                console.log(accessToken); // JSON data parsed by `data.json()` call
                const chat = document.getElementById('join-chat');
                chat.style.display = '';
                const login = document.getElementById('login-div');
                login.style.display = 'none';

            }

            console.log(`token: ${data.accessToken}`);
            // console.log(`username: ${user.username}`);
            const socket = io("http://localhost:3000", {
                auth: {
                    token: data.accessToken,
                    // token: data.accessToken,
                    // username: user.username
                },
                transports: ['websocket', 'polling'],
                withCredentials: true
            });
            socket.on("connect_error", () => {
                console.log("error");
            })
            socket.on("connect", () => {
                console.log("connected");
            })
        });

}


                // const socket = io.connect('http://localhost:3000', {
                //     query: {accessToken}
                // });
                // // join chat room
                // const name ="kinan"
                // const ro = "room"
                // socket.emit('joinRoom', {name, ro})
                // const chatMessages = document.querySelector('.chat-messages');

// // get room and users info
//                 socket.on('roomUsers', ({room, users}) => {
//                     outputRoom(room);
//                     outputUsers(users);
//                 });

// // message from server
//                 socket.on('message', message => {
//                     // console.log(message);
//                     messageHandler(message);
//
//                     // scroll down
//                     chatMessages.scrollTop = chatMessages.scrollHeight;
//                 })
//
// // message submit
//                 chatForm.addEventListener('submit', (e) => {
//                     e.preventDefault();
//
//                     // Get message text
//                     const message = e.target.elements.namedItem('msg').value;
//
//                     // Emit message to server
//                     socket.emit('chatMessage', message);
//
//                     // clear chat input
//                     e.target.elements.namedItem('msg').value = '';
//                     e.target.elements.namedItem('msg').focus();
// //                 });
//             }
//             alert(data.message);
//         });
// }

const form = document.getElementById('login');
form.addEventListener('submit', handleSubmit);

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');


// const coolieParser = require('cookie-parser');
const path = require('path');

// middlewares
const jwtSocketHandler = require('./middleware/jwtSocketHandler');
const jwtRouterHandler = require('./middleware/jwtRoutersHandler');
const credential = require('./middleware/credentials');
const corsOptions = require('./config/corsOptions');
const rolesList = require('./config/rolesList');
const verifyRoles = require('./middleware/verifyRoles');

// routes
const auth = require('./routers/auth');
const refresh = require('./routers/refresh');
const register = require('./routers/register');
const logout = require('./routers/logout');
const allUsers = require('./routers/users');

// Data Base
const mongodb = require('./db/mongo');

// utils
const {
  userJoin, getUser, userLeave, getRoomUsers, getConsultants,
  getOnlineUsers, addToWaitingList, getWaitingList, leaveWaitingList,
  isConsultant, consultantNotAvailable, getUserByName, onlineUsersList, logoutOnlineUsersList
} = require('./utils/users');

const {
  welcomeMessage, askToChatMessage, acceptToChatMessage, consultantRefuseToChaMessage,
  leaveChatMessage, chatMessage, leavingRoomMessage
}= require('./utils/messages');

const {
  createRoom, getRoom, getRoomChatMessages,
  setRoomCapacity, insertMessage, getAllRooms, joinRoom, getActiveRooms, modifyRoom
} = require('./utils/rooms');


// Constants
const BOTNAME = 'Chat Bot';
const PORT = process.env.PORT || 9000;
const PublicRoom = "Public Room"
app.use(express.json());
app.use(credential);

app.use(cors(corsOptions));

// set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(coolieParser);


app.use('/register', register);
app.use('/auth', auth);
app.use('/refresh', refresh);
// app.use(jwtRouterHandler);
app.use('/users', allUsers);

// app.use(verifyRoles(rolesList.User));
app.use('/logout', logout);

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
// const io = new Server(9000, { allowRequest: cors(corsOptions)});

const io = new Server(3000, {
  cors:{
    origin: 'http://localhost:8080'
  }
});

io.use(jwtSocketHandler);

// aux function and fake data Chat Bot


// let users = [];

// Fake data
const contact = {
  contactEmail: "contact@gmail.com",
  contactNumber: "0160293759",
};

let nextMaintenanceId = 4;
const maintenanceAppointments = [
  // {
  //   id: 1,
  //   date: new Date("December 13, 2022 15:00:00"),
  // },
  {
    id: 2,
    date: new Date("December 15, 2022 10:00:00"),
  },
  // {
  //   id: 3,
  //   date: new Date("December 16, 2022 13:00:00"),
  // },
];

let nextRevisionId = 3;
const revisionAppointments = [
  {
    id: 1,
    date: new Date("December 13, 2022 15:00:00"),
  },
  {
    id: 2,
    date: new Date("December 15, 2022 10:00:00"),
  },
  // {
  //   id: 3,
  //   date: new Date("December 16, 2022 13:00:00"),
  // },
];

let nextRoadAppointmentId = 4;
const roadAppointments = [
  // {
  //   id: 1,
  //   date: new Date("December 13, 2022 15:00:00"),
  // },
  {
    id: 2,
    date: new Date("December 28, 2022 10:00:00"),
  },
  {
    id: 3,
    date: new Date("December 29, 2022 13:00:00"),
  },
];


let nextOffroadAppointmentId = 4;
const offroadAppointments = [
  // {
  //   id: 1,
  //   date: new Date("December 13, 2022 15:00:00"),
  // },
  {
    id: 2,
    date: new Date("December 28, 2022 10:00:00"),
  },
  {
    id: 3,
    date: new Date("December 29, 2022 13:00:00"),
  },
];


let nextSportAppointmentId = 4;
const sportAppointments = [
  // {
  //   id: 1,
  //   date: new Date("December 13, 2022 15:00:00"),
  // },
  {
    id: 2,
    date: new Date("December 28, 2022 10:00:00"),
  },
  {
    id: 3,
    date: new Date("December 29, 2022 13:00:00"),
  },
];
// End Fake data

const startChatBot = (socket) => {
  socket.emit("ask_help_type", {
    from: "server",
    txt: `Type d'aide souhaité ?
1 : Vérfier l'enretien de mon véhicule
2 : Avoir des informations sur un véhicule
3 : Avoir des informations de contact
Ou cliquez sur le bouton 'Arreter' pour arreter de discuter`,
  });
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextMonday(date = new Date()) {
  const dateCopy = new Date(date.getTime());
  const nextMonday = new Date(
      dateCopy.setDate(
          dateCopy.getDate() + ((7 - dateCopy.getDay() + 1) % 7 || 7)
      )
  );

  return nextMonday;
}

const sendMessage = (socket, emitType, value) => {
  socket.emit(emitType, value);
};

//

io.on('connection', async (socket) => {
  // create Public Room if not exist
  const PUBLIC_ROOM_ID = await createRoom("Public Room");
  // console.log("PUBLIC_ROOM", PUBLIC_ROOM_ID);

  let user = getUserByName(socket.handshake.auth.username);
  // check if user is already connected
  if(user !== undefined){
    // if yes get the user socket
    // console.log("sss  ", user)
    const user_socket = io.sockets.sockets.get(user.id);
    if(user_socket){
      socket = user_socket;
    }
  }
  else{
    user = userJoin(socket.id, socket.handshake.auth.username, socket.handshake.auth.roles, PUBLIC_ROOM_ID);
  }
  socket.join(user.room);

  // socket.on('joinRoom', {room, user})

  //if user is consultant
  if (user.isAvailable) {
    io.emit('availableConsultants', getConsultants());
  }
  socket.emit('roles', user.roles);
  // console.log('user:n ', user)
  welcomeMessage(BOTNAME, `Welcome ${user.username}`, user.room, socket);
  socket.emit('availableConsultants', getConsultants());
  // socket.join(user.room)
  socket.emit('waitingList', getWaitingList(user.id));
  await getActiveRooms(socket);

  // socket.on('askToChat', (id) => {
  //   io.to(id).emit('message', formatMessage(user.username, 'askToChat'));
  //   addToWaitingList(id, user);
  //   io.to(id).emit("waitingList", getWaitingList(id));
  //   const room = `${id}${user.id}`
  //   socket.leave(user.room);
  //   user.room = room;
  //   socket.join(room);
  // });
  socket.on('askToChat', (id) => {
    // askToChatMessage(id, user.username, 'askToChat', user.room, io);
    addToWaitingList(id, user);
    console.log("in askToChat");
    io.to(id).emit("waitingList", getWaitingList(id));
    socket.leave(user.room);
    // const room = `${id}${user.id}`
    // user.room = room;
    // socket.join(room);
  });

  socket.on('acceptToChat', async (id) => {
    leaveWaitingList(id, user);
    const newRoomName = `${user.id}${id}`;
    const client = getUser(id);
    const newRoomId = await createRoom(newRoomName, false);
    console.log("newRoom: ", newRoomId, " newRoomName: ", newRoomName);
    const client_socket = io.sockets.sockets.get(client.id);
    socket.leave(user.room);
    client_socket.leave(client.room);
    client.room = newRoomId;
    user.room = newRoomId;
    user.isAvailable = false;
    console.log("in acceptToChat");
    socket.emit("waitingList", getWaitingList(user.id))
    io.emit('availableConsultants', getConsultants());
    socket.join(newRoomId);
    client_socket.join(newRoomId);
    await acceptToChatMessage(BOTNAME, `${user.username} has accept your request`, newRoomId, client_socket);
    // console.log("newRoom: ", newRoom);

    // socket.to(room).emit('message', formatMessage(BOTNAME, `${user.username} has accept your request`, room));
  });

  socket.on('refuseToChat', (id) => {
    const client = getUser(id);
    leaveWaitingList(id, user);
    socket.emit("waitingList", getWaitingList(id))
    io.to(id).socketsLeave(client.room);
    client.room = PUBLIC_ROOM_ID;
    io.to(id).socketsJoin(client.room);
    consultantRefuseToChaMessage(client.id, BOTNAME, `${user.username} has refuse your request`, client.room, socket);
  });
  socket.on('createRoom', (newRoomName) => {
    const newRoomId = createRoom(newRoomName);
    getAllRooms(io);
    // io.to(user.room).emit('message', formatMessage1(user.username, message, user.room, io));
  });
  socket.on('modifyRoom', (roomId, newRoomName, newRoomCapacity) =>{
    console.log("modifyRoom", roomId, newRoomName, newRoomCapacity)

    modifyRoom(roomId, newRoomName, newRoomCapacity);
  });

  socket.on('leaveChat', () => {
    // const id = user.room.replace(user.id, "");
    if (isConsultant(user.roles)) {
      user.isAvailable = true;
      io.emit('availableConsultants', getConsultants());
    }
    leaveChatMessage(BOTNAME, `${user.username} has left the chat`, user.room, socket);
    socket.leave(user.room);
    user.room = PUBLIC_ROOM_ID;
    socket.join(user.room);
  });

  // send users and room info
  io.to(user.room).emit('roomUsers', {
    users: getRoomUsers(user.room)
  });

  // listen for chatMessage
  socket.on('chatMessage', (message) => {
    const user = getUser(socket.id);
    if(user){
      chatMessage(user.username, message, user.room, io);
    }
    // io.to(user.room).emit('message', formatMessage1(user.username, message, user.room, io));
  });
  // when user leaving room
  socket.on("leavingRoom", () => {
    socket.leave(user.room);
    leavingRoomMessage(BOTNAME,`${user.username} has left the room`, user.room, socket)
    user.room = user.id;
  });

  // Consultant availability
  socket.on("availability", (isAvailable) => {
    if (user && user.hasOwnProperty('isAvailable')) {
      user.isAvailable = isAvailable;
      console.log("available: ", user.isAvailable)
      if (isAvailable === false) {
        consultantNotAvailable(io, socket, user, PUBLIC_ROOM_ID);
      }
      io.emit('availableConsultants', getConsultants());
    }
  });

  socket.on("getAvailable", () => {
    if (user.hasOwnProperty('isAvailable')) {
      socket.emit('isAvailable', user.isAvailable)
    }
  });

  // when a user disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (user.isAvailable) {
      user.isAvailable = false;
      io.emit('availableConsultants', getConsultants());
    }
    socket.leave(user.room);
    user.room = user.id;
    logoutOnlineUsersList(user.id);

    // socket.broadcast.emit("chatMessage", "A user has been disconnected");
  });

  socket.on('joinRoom', (roomId) => {
    joinRoom(roomId, user, socket)
  });

  // chat Bot
  socket.on('chatBot', () => {
    console.log("startChat ...")


    let vehiculeInfo = {};
    // appointments
    let availableMaintenanceDates = [];
    let availableRevisionDates = [];

    // vehicule info
    let availableRoadDates = [];
    let availableOffroadDates = [];
    let availableSportDates = [];

    const calcAvailableMaintenanceDates = () => {
      let nextAvailableMaintenanceId = 1;
      let today = new Date("2022-12-23");
      // let today = new Date();
      let currentDay = today.getDay();
      availableMaintenanceDates = [];
      for (let day = today.getDay(); day < 6; day++) {
        if (
            !maintenanceAppointments.some(
                (e) => e.date.getDate() === addDays(today, day - currentDay).getDate()
            )
        ) {
          if (day > 0 && day < 6) {
            availableMaintenanceDates.push({
              id: nextAvailableMaintenanceId,
              date: addDays(today, day - currentDay),
            });
            nextAvailableMaintenanceId += 1;
          }
        }
      }
      if (availableMaintenanceDates.length === 0) {
        today = getNextMonday();
        let currentDay = today.getDay();
        availableMaintenanceDates = [];
        for (let day = today.getDay(); day < 6; day++) {
          if (
              !maintenanceAppointments.some(
                  (e) =>
                      e.date.getDate() === addDays(today, day - currentDay).getDate()
              )
          ) {
            if (day > 0 && day < 6) {
              availableMaintenanceDates.push({
                id: nextAvailableMaintenanceId,
                date: addDays(today, day - currentDay),
              });
              nextAvailableMaintenanceId += 1;
            }
          }
        }
      }
    };

    const calcAvailableRevisionDates = () => {
      let nextAvailableRevisionId = 1;
      let today = new Date("2022-12-23");
      // let today = new Date();
      let currentDay = today.getDay();
      availableRevisionDates = [];
      for (let day = today.getDay(); day < 6; day++) {
        if (
            !revisionAppointments.some(
                (e) => e.date.getDate() === addDays(today, day - currentDay).getDate()
            )
        ) {
          if (day > 0 && day < 6) {
            availableRevisionDates.push({
              id: nextAvailableRevisionId,
              date: addDays(today, day - currentDay),
            });
            nextAvailableRevisionId += 1;
          }
        }
      }
      if (availableRevisionDates.length === 0) {
        today = getNextMonday();
        let currentDay = today.getDay();
        availableRevisionDates = [];
        for (let day = today.getDay(); day < 6; day++) {
          if (
              !revisionAppointments.some(
                  (e) =>
                      e.date.getDate() === addDays(today, day - currentDay).getDate()
              )
          ) {
            if (day > 0 && day < 6) {
              availableRevisionDates.push({
                id: nextAvailableRevisionId,
                date: addDays(today, day - currentDay),
              });
              nextAvailableRevisionId += 1;
            }
          }
        }
      }
    };

    const calcAvailableRoadDates = () => {
      let nextAvailableRoadId = 1;
      let today = new Date("2022-12-23");
      // let today = new Date();
      let currentDay = today.getDay();
      availableRoadDates = [];
      for (let day = today.getDay(); day < 6; day++) {
        if (
            !roadAppointments.some(
                (e) => e.date.getDate() === addDays(today, day - currentDay).getDate()
            )
        ) {
          if (day > 0 && day < 6) {
            availableRoadDates.push({
              id: nextAvailableRoadId,
              date: addDays(today, day - currentDay),
            });
            nextAvailableRoadId += 1;
          }
        }
      }
      if (availableRoadDates.length === 0) {
        today = getNextMonday();
        let currentDay = today.getDay();
        availableRoadDates = [];
        for (let day = today.getDay(); day < 6; day++) {
          if (
              !roadAppointments.some(
                  (e) =>
                      e.date.getDate() === addDays(today, day - currentDay).getDate()
              )
          ) {
            if (day > 0 && day < 6) {
              availableRoadDates.push({
                id: nextAvailableRoadId,
                date: addDays(today, day - currentDay),
              });
              nextAvailableRoadId += 1;
            }
          }
        }
      }
    };

    const calcAvailableOffroadDates = () => {
      let nextAvailableOffroadId = 1;
      let today = new Date("2022-12-23");
      // let today = new Date();
      let currentDay = today.getDay();
      availableOffroadDates = [];
      for (let day = today.getDay(); day < 6; day++) {
        if (
            !offroadAppointments.some(
                (e) => e.date.getDate() === addDays(today, day - currentDay).getDate()
            )
        ) {
          if (day > 0 && day < 6) {
            availableOffroadDates.push({
              id: nextAvailableOffroadId,
              date: addDays(today, day - currentDay),
            });
            nextAvailableOffroadId += 1;
          }
        }
      }
      if (availableOffroadDates.length === 0) {
        today = getNextMonday();
        let currentDay = today.getDay();
        availableOffroadDates = [];
        for (let day = today.getDay(); day < 6; day++) {
          if (
              !offroadAppointments.some(
                  (e) =>
                      e.date.getDate() === addDays(today, day - currentDay).getDate()
              )
          ) {
            if (day > 0 && day < 6) {
              availableOffroadDates.push({
                id: nextAvailableOffroadId,
                date: addDays(today, day - currentDay),
              });
              nextAvailableOffroadId += 1;
            }
          }
        }
      }
    };

    const calcAvailableSportDates = () => {
      let nextAvailableSportId = 1;
      let today = new Date("2022-12-23");
      // let today = new Date();
      let currentDay = today.getDay();
      availableSportDates = [];
      for (let day = today.getDay(); day < 6; day++) {
        if (
            !sportAppointments.some(
                (e) => e.date.getDate() === addDays(today, day - currentDay).getDate()
            )
        ) {
          if (day > 0 && day < 6) {
            availableSportDates.push({
              id: nextAvailableSportId,
              date: addDays(today, day - currentDay),
            });
            nextAvailableSportId += 1;
          }
        }
      }
      if (availableSportDates.length === 0) {
        today = getNextMonday();
        let currentDay = today.getDay();
        availableSportDates = [];
        for (let day = today.getDay(); day < 6; day++) {
          if (
              !sportAppointments.some(
                  (e) =>
                      e.date.getDate() === addDays(today, day - currentDay).getDate()
              )
          ) {
            if (day > 0 && day < 6) {
              availableSportDates.push({
                id: nextAvailableSportId,
                date: addDays(today, day - currentDay),
              });
              nextAvailableSportId += 1;
            }
          }
        }
      }
    };

    socket.on("disconnect", () => {
      console.log("user disconnected");
      socket.broadcast.emit("chat message", "A user has been disconnected");
    });

    startChatBot(socket);

    socket.on("reset_bot", () => {
      startChatBot(socket);
    });

    socket.on("send_help_type", (res) => {
      if (res === 1) {
        sendMessage(socket, "ask_vehicule_year", {
          from: "server",
          txt: "Saisir l'année d'immatriculation",
        });
      } else if (res === 2) {
        sendMessage(socket, "ask_usage_type", {
          from: "server",
          txt: `Type d'usage ?
1 : Routier
2 : Tout terrain
3 : Sportif`,
        });
      } else {
        sendMessage(socket, "ask_contact_type", {
          from: "server",
          txt: `Type de contact ?
1 : Email
2 : Téléphone`,
        });
      }
    });

    socket.on("send_vehicule_year", (res) => {
      vehiculeInfo = {
        ...vehiculeInfo,
        vehiculeYear: res,
      };
      sendMessage(socket, "ask_last_maintenance_date", {
        from: "server",
        txt: "Saisir la date du dernier entretien",
        vehiculeInfo,
      });
    });

    socket.on("send_last_maintenance_date", (res) => {
      vehiculeInfo = {
        ...vehiculeInfo,
        lastMaintenanceDate: res,
      };
      let yearDiff = Math.abs(
          new Date(vehiculeInfo.lastMaintenanceDate).getFullYear() -
          new Date().getFullYear()
      );
      if (yearDiff > 1) {
        calcAvailableMaintenanceDates();
        sendMessage(socket, "ask_appointment_date", {
          from: "server",
          txt: availableMaintenanceDates,
          vehiculeInfo,
        });
      } else {
        sendMessage(socket, "ask_km_since_last_maintenance", {
          from: "server",
          txt: "Saisir le nombre de kilomètres parcourus depuis le dernier entretien",
          vehiculeInfo,
        });
      }
    });

    socket.on("send_maintenance_appointment_date", (res) => {
      if (availableMaintenanceDates.some((e) => e.id === res)) {
        maintenanceAppointments.push({
          id: nextMaintenanceId,
          date: availableMaintenanceDates.find((e) => e.id === res).date,
        });
        nextMaintenanceId += 1;
        socket.emit("maintenance_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("maintenance_appointment_added_by_other_user");
      }
    });

    socket.on("send_km_since_maintenance_date", (res) => {
      vehiculeInfo = {
        ...vehiculeInfo,
        kmSinceLastMaintenance: res,
      };
      if (vehiculeInfo.kmSinceLastMaintenance >= 10000) {
        calcAvailableMaintenanceDates();
        sendMessage(socket, "ask_appointment_date", {
          from: "server",
          txt: availableMaintenanceDates,
          vehiculeInfo,
        });
        // }
      } else {
        sendMessage(socket, "ask_do_revision", {
          from: "server",
          txt: `Souhaitez-vous effectuer une révision ?
1 : Oui
2 : Non`,
          vehiculeInfo,
        });
      }
    });

    socket.on("send_do_revision", (res) => {
      if (res === 1) {
        // TODO demande rdv
        calcAvailableRevisionDates();
        sendMessage(socket, "ask_revision_date", {
          from: "server",
          txt: availableRevisionDates,
        });
      } else {
        socket.emit("reset_chat");
      }
    });

    socket.on("send_revision_date", (res) => {
      if (availableRevisionDates.some((e) => e.id === res)) {
        revisionAppointments.push({
          id: nextRevisionId,
          date: availableRevisionDates.find((e) => e.id === res).date,
        });
        nextRevisionId += 1;
        socket.emit("revision_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("revision_appointment_added_by_other_user");
      }
    });

    socket.on("send_usage_type", (res) => {
      if (res === 1) {
        calcAvailableRoadDates();
        sendMessage(socket, "ask_road_appointment_date", {
          from: "server",
          txt: availableRoadDates,
        });
      } else if (res === 2) {
        calcAvailableOffroadDates();
        sendMessage(socket, "ask_offroad_appointment_date", {
          from: "server",
          txt: availableOffroadDates,
        });
      } else {
        calcAvailableSportDates();
        sendMessage(socket, "ask_sport_appointment_date", {
          from: "server",
          txt: availableSportDates,
        });
      }
    });

    socket.on("send_road_appointment_date", (res) => {
      if (availableRoadDates.some((e) => e.id === res)) {
        roadAppointments.push({
          id: nextRoadAppointmentId,
          date: availableRoadDates.find((e) => e.id === res).date,
        });
        nextRoadAppointmentId += 1;
        socket.emit("road_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("road_appointment_added_by_other_user");
      }
    });

    socket.on("send_offroad_appointment_date", (res) => {
      console.log(res)
      if (availableOffroadDates.some((e) => e.id === res)) {
        offroadAppointments.push({
          id: nextOffroadAppointmentId,
          date: availableOffroadDates.find((e) => e.id === res).date,
        });
        nextOffroadAppointmentId += 1;
        socket.emit("offroad_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("offroad_appointment_added_by_other_user");
      }
    });

    socket.on("send_sport_appointment_date", (res) => {
      if (availableSportDates.some((e) => e.id === res)) {
        sportAppointments.push({
          id: nextSportAppointmentId,
          date: availableSportDates.find((e) => e.id === res).date,
        });
        nextSportAppointmentId += 1;
        socket.emit("sport_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("sport_appointment_added_by_other_user");
      }
    });

    socket.on("send_contact_type", (res) => {
      if (res === 1) {
        sendMessage(socket, "send_contact_email", {
          from: "server",
          txt: `Email : ${contact.contactEmail}`,
        });
      } else {
        sendMessage(socket, "send_contact_number", {
          from: "server",
          txt: `Number : ${contact.contactNumber}`,
        });
      }
    });
  });

  // end chat Bot

});

// ioChatbot.on('connection', (socket) => {})
// io.use(cors(corsOptions));
// example of use verifyRole :
// .get(verifyRole(rolesList.Admin, rolesList.User),

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//   },
//   cookie: true
// });


// app.use(express.json());
// app.use(coolieParser);


// set static folder
//
// app.use('/register', register);
// app.use('/auth', auth);
// app.use('/refresh', refresh);
// app.use('/logout', logout);

// app.use(jwtSocketHandler);
// app.use(express.static(path.join(__dirname, 'public')));
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/index.html");
// });
// io.on("connection", (socket) => {
//   console.log("Anonymous client connected");
//
// });




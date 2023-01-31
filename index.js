const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');


// const coolieParser = require('cookie-parser');
const path = require('path');
// const formatMessage = require('./utils/messages')
// const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

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
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getConsultants,
  getOnlineUsers,
  addToWaitingList,
  getWaitingList,
  leaveWaitingList
} = require('./utils/users');
const formatMessage = require('./utils/messages');

// Constants
const BotName = 'Chat Bot';
const PORT = process.env.PORT || 3000;
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

const io = new Server(9000, {
  cors:{
    origin: 'http://localhost:8080'
  }
});

// function addToWaitList (user, roomWaitingList) {
//   roomWaitingList.push(user);
//   console.log("roomWaitingList: ", roomWaitingList);
//
// };

// io.use(cors(corsOptions));
io.use(jwtSocketHandler);
io.on('connection', (socket) => {
  // console.log("on connection", socket.handshake.auth);
  const user = userJoin(socket.id, socket.handshake.auth.username, socket.handshake.auth.roles, PublicRoom);
  socket.emit( 'roles', user.roles);

  socket.emit( 'message', formatMessage(BotName,`Welcome ${user.username}`));
  socket.emit('availableConsultants', getConsultants());
  // socket.join(user.room)
  socket.emit('waitingList',  getWaitingList(user.id));


  socket.on('askToChat', (id) => {
    io.to(id).emit('message', formatMessage(user.username, 'askToChat'));
    addToWaitingList(id, user);
    io.to(id).emit("waitingList", getWaitingList(id));
    const room = `${id}${user.id}`
    console.log("askToChat socket ", room)
    user.room = room;
    socket.join(room);
  });

  socket.on('acceptToChat', (id) => {
    leaveWaitingList(id, user);
    const room = `${user.id}${id}`
    user.room = room;
    socket.join(room);
    socket.to(room).emit('message', formatMessage(BotName, `${user.username} has accept your request`));
  });
    // broadcast when a user connect
    // socket.to(id).emit('message', formatMessage(BotName,`${user.username} has join the chat`));

    // send users and room info
    io.to(user.room).emit('roomUsers', {
      users: getRoomUsers(user.room)
    });

    // listen for chatMessage
    socket.on('chatMessage', (message) => {
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit('message', formatMessage( user.username ,message));
    });

    // when user leaving room
    socket.on("leavingRoom", () => {
    socket.leave(user.room);
    socket.to(user.room).emit("chatMessage", `${user.username} has left the room`);
    user.room = user.id;
  });

    // when a user disconnect
    socket.on("disconnect", () => {
      console.log("user disconnected");
      socket.leave(user.room);
      user.room = user.id;
      socket.broadcast.emit("chatMessage", "A user has been disconnected");
    });

    //
    // welcome new user
    // socket.emit('message', formatMessage(BotName,`${user.username} has accept your request`));

  // });


  // socket.on('chatMessage', (message) => {
  //   io.to(user.room).emit('message', formatMessage( user.username ,message));
  // })
  // socket.on('disconnect', () => {
  //   const user = userLeave(socket.id);
  //   console.log("disconnect: ", user, "users on ", getOnlineUsers())
  //
  //   if(user) {
  //     io.to(user.room).emit('message', formatMessage(BotName,`${user.username} had left`));
  //     // send users and room info
  //     io.to(user.room).emit('roomUsers', {
  //       room: user.room,
  //       users: getRoomUsers(user.room)
  //     });
  //   }
  // });
  // socket.emit( "message", user);
  socket.on('joinRoom', (room) => {
  });
  //
  //   // welcome new user
  //   socket.emit('message', formatMessage(BotName,`${user.username} has accept your request`));
  //   socket.to(id).emit('message', formatMessage(BotName,`${user.username} has accept your request`));
  //
  //   // broadcast when a user connect
  //   socket.to(id).emit('message', formatMessage(BotName,`${user.username} has join the chat`));
  //
  //   // send users and room info
  //   io.to(id).emit('roomUsers', {
  //     room: user.room,
  //     users: getRoomUsers(user.room)
  //   });
  //
  //   // listen for chatMessage
  //   socket.on('chatMessage', (message) => {
  //     const user = getCurrentUser(socket.id);
  //     io.to(id).emit('message', formatMessage( user.username ,message));
  //   });
  //
  //
  //
  //   //
  //   // // welcome new user
  //   // socket.emit('message', formatMessage(BotName,'welcome to chat'));
  //   //
  //   // // broadcast when a user connect
  //   // socket.to(user.room).emit('message', formatMessage(BotName,`${user.username} has join the chat`));
  //   //
  //   // // send users and room info
  //   // io.to(user.room).emit('roomUsers', {
  //   //   room: user.room,
  //   //   users: getRoomUsers(user.room)
  //   // });
  //   //
  //   // // listen for chatMessage
  //   // socket.on('chatMessage', (msg) => {
  //   //   const user = getCurrentUser(socket.id);
  //   //   io.to(user.room).emit('message', formatMessage( user.username ,msg));
  //   // });
  //   //
  //   // // when a user disconnect
  //
  // });
})
// io.use(cors(corsOptions));
// example of use verifyRole :
// .get(verifyRole(rolesList.Admin, rolesList.User),
/*
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
  cookie: true
});

let users = [];

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

app.use(express.json());
// app.use(coolieParser);


// set static folder

app.use('/register', register);
app.use('/auth', auth);
app.use('/refresh', refresh);
app.use('/logout', logout);

// app.use(jwtSocketHandler);
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
io.on("connection", (socket) => {
  console.log("Anonymous client connected");

  let vehiculeInfo = {};
  let availableMaintenanceDates = [];
  let availableRevisionDates = [];

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
      // TODO demande rdv routier
      socket.emit("reset_chat");
    } else if (res === 2) {
      // TODO demande rdv tout-terrain
      socket.emit("reset_chat");
    } else {
      // TODO demande rdv sportif
      socket.emit("reset_chat");
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


// app.use(jwtSocketHandler);

const PORT = process.env.PORT || 3000;
app.use(coolieParser);

io.use(jwtSocketHandler)
io.on("connection", socket => {
  // console.log("connected")
})
*/

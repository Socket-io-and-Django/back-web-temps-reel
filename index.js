const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

// const coolieParser = require('cookie-parser');
const path = require('path');

// middlewares
const jwtSocketHandler = require("./middleware/jwtSocketHandler");
const jwtRouterHandler = require("./middleware/jwtRoutersHandler");
const credential = require("./middleware/credentials");
const corsOptions = require("./config/corsOptions");
const rolesList = require("./config/rolesList");
const verifyRoles = require("./middleware/verifyRoles");

// routes
const auth = require("./routers/auth");
const refresh = require("./routers/refresh");
const register = require("./routers/register");
const logout = require("./routers/logout");
const allUsers = require("./routers/users");

// Data Base
const mongodb = require("./db/mongo");

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
  leaveWaitingList,
  isConsultant,
} = require("./utils/users");
const formatMessage = require("./utils/messages");
const {
  saveNewMaintenanceAppointment,
  getAllMaintenanceAppointments,
  getNextMaintenanceAppointmentId,
} = require("./controllers/maintenanceAppointmentsController");

const {
  saveNewRevisionAppointment,
  getAllRevisionAppointments,
  getNextRevisionAppointmentId,
} = require("./controllers/revisionAppointmentsController");

const {
  saveNewRoadAppointment,
  getAllRoadAppointments,
  getNextRoadAppointmentId,
} = require("./controllers/roadAppointmentsController");

const {
  saveNewOffroadAppointment,
  getAllOffroadAppointments,
  getNextOffroadAppointmentId,
} = require("./controllers/offroadAppointmentsController");

const {
  saveNewSportAppointment,
  getAllSportAppointments,
  getNextSportAppointmentId,
} = require("./controllers/sportAppointmentsController");

// Constants
const BotName = "Chat Bot";
const PORT = process.env.PORT || 9000;
const PublicRoom = "Public Room";
app.use(express.json());
app.use(credential);

app.use(cors(corsOptions));

// set static folder
// app.use(express.static(path.join(__dirname, 'public')));

// app.use(coolieParser);

app.use("/register", register);
app.use("/auth", auth);
app.use("/refresh", refresh);
// app.use(jwtRouterHandler);
app.use("/users", allUsers);

// app.use(verifyRoles(rolesList.User));
app.use("/logout", logout);

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
// const io = new Server(9000, { allowRequest: cors(corsOptions)});

const io = new Server(3000, {
  cors: {
    origin: "http://localhost:8080",
  },
});

io.use(jwtSocketHandler);

// aux function and fake data Chat Bot

// let users = [];

// Fake data
const contact = {
  contactEmail: "contact@gmail.com",
  contactNumber: "0160293759",
};

let maintenanceAppointments = [];

let revisionAppointments = [];

let roadAppointments = [];

let offroadAppointments = [];

let sportAppointments = [];
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

io.on("connection", (socket) => {
  // console.log("on connection", socket.handshake.auth);
  const user = userJoin(
    socket.id,
    socket.handshake.auth.username,
    socket.handshake.auth.roles,
    PublicRoom
  );
  socket.join(user.room);
  if (user.isAvailable) {
    io.emit("availableConsultants", getConsultants());
  }
  socket.emit("roles", user.roles);

  socket.emit("message", formatMessage(BotName, `Welcome ${user.username}`));

  socket.emit("availableConsultants", getConsultants());
  // socket.join(user.room)
  socket.emit('waitingList',  getWaitingList(user.id));

  socket.on('askToChat', (id) => {
    io.to(id).emit('message', formatMessage(user.username, 'askToChat'));
    addToWaitingList(id, user);
    io.to(id).emit("waitingList", getWaitingList(id));
    const room = `${id}${user.id}`;
    socket.leave(user.room);
    user.room = room;
    socket.join(room);
  });

  socket.on("acceptToChat", (id) => {
    leaveWaitingList(id, user);
    const room = `${user.id}${id}`;
    socket.leave(user.room);
    user.room = room;
    user.isAvailable = false;
    socket.emit("waitingList", getWaitingList(id));
    io.emit("availableConsultants", getConsultants());
    socket.join(user.room);
    socket
      .to(room)
      .emit(
        "message",
        formatMessage(BotName, `${user.username} has accept your request`)
      );
  });

  socket.on('refuseToChat', (id) => {
    const client = getCurrentUser(id);
    leaveWaitingList(id, user);
    socket.emit("waitingList", getWaitingList(id))
    io.to(id).socketsLeave(client.room);
    client.room = "Public Room";
    io.to(id).socketsJoin(client.room);
    socket.to(client.id).emit('consultantRefuseToChat', formatMessage(BotName, `${user.username} has refuse your request`));
  });

  socket.on('leaveChat', () => {
    const id = user.room.replace(user.id, "");
    if (isConsultant(user.roles)) {
      user.isAvailable = true;
      io.emit("availableConsultants", getConsultants());
    } else {
      leaveWaitingList(user.id, getCurrentUser(id));
    }
    socket
      .to(user.room)
      .emit(
        "message",
        formatMessage(BotName, `${user.username} has left the chat`)
      );
    socket.leave(user.room);
    user.room = PublicRoom;
    socket.join(user.room);
    io.to(id).emit("waitingList", getWaitingList(id));
  });

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

  // Consultant availability
  socket.on("availability", (isAvailable) => {
    if(user && user.hasOwnProperty('isAvailable')) {
      user.isAvailable = isAvailable;
      console.log("available: ", user.isAvailable)
      if(isAvailable === false) {
        consultantNotAvailable(io, socket, user);
      }
      io.emit('availableConsultants', getConsultants());
    }
  });

  socket.on("getAvailable", () => {
    if(user.hasOwnProperty('isAvailable')){
      socket.emit('isAvailable', user.isAvailable )
    }
  });



  // when a user disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
    if(user.isAvailable){
      user.isAvailable = false;
      io.emit('availableConsultants', getConsultants());
    }
    socket.leave(user.room);
    user.room = user.id;
    socket.broadcast.emit("chatMessage", "A user has been disconnected");
  });

  socket.on('joinRoom', (room) => {
  });

  socket.on("joinRoom", (room) => {});

  // chat Bot
  socket.on("chatBot", () => {
    console.log("startChat ...");

    let vehiculeInfo = {};
    // appointments
    let availableMaintenanceDates = [];
    let availableRevisionDates = [];
    let availableRoadDates = [];
    let availableOffroadDates = [];
    let availableSportDates = [];

    const calcAvailableMaintenanceDates = async () => {
      maintenanceAppointments = await getAllMaintenanceAppointments();
      let nextAvailableMaintenanceId = await getNextMaintenanceAppointmentId();
      let today = new Date();
      // let today = new Date();
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

    const calcAvailableRevisionDates = async () => {
      revisionAppointments = await getAllRevisionAppointments();
      let nextAvailableRevisionId = await getNextRevisionAppointmentId();
      let today = new Date();
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

    const calcAvailableRoadDates = async () => {
      roadAppointments = await getAllRoadAppointments();
      let nextAvailableRoadId = await getNextRoadAppointmentId();
      let today = new Date();
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

    const calcAvailableOffroadDates = async () => {
      offroadAppointments = await getAllOffroadAppointments();
      let nextAvailableOffroadId = await getNextOffroadAppointmentId()
      let today = new Date();
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

    const calcAvailableSportDates = async () => {
      sportAppointments = await getAllSportAppointments()
      let nextAvailableSportId = await getNextSportAppointmentId()
      let today = new Date();
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

    socket.on("send_last_maintenance_date", async (res) => {
      vehiculeInfo = {
        ...vehiculeInfo,
        lastMaintenanceDate: res,
      };
      let yearDiff = Math.abs(
        new Date(vehiculeInfo.lastMaintenanceDate).getFullYear() -
          new Date().getFullYear()
      );
      if (yearDiff > 1) {
        await calcAvailableMaintenanceDates();
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

    socket.on("send_maintenance_appointment_date", async (res) => {
      if (availableMaintenanceDates.some((e) => e.id === res)) {
        await saveNewMaintenanceAppointment(
          await getNextMaintenanceAppointmentId(),
          availableMaintenanceDates.find((e) => e.id === res).date
        );
        socket.emit("maintenance_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("maintenance_appointment_added_by_other_user");
      }
    });

    socket.on("send_km_since_maintenance_date", async (res) => {
      vehiculeInfo = {
        ...vehiculeInfo,
        kmSinceLastMaintenance: res,
      };
      if (vehiculeInfo.kmSinceLastMaintenance >= 10000) {
        await calcAvailableMaintenanceDates();
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

    socket.on("send_do_revision", async (res) => {
      if (res === 1) {
        // TODO demande rdv
        await calcAvailableRevisionDates();
        sendMessage(socket, "ask_revision_date", {
          from: "server",
          txt: availableRevisionDates,
        });
      } else {
        socket.emit("reset_chat");
      }
    });

    socket.on("send_revision_date", async (res) => {
      if (availableRevisionDates.some((e) => e.id === res)) {
        await saveNewRevisionAppointment(
          await getNextRevisionAppointmentId(),
          availableRevisionDates.find((e) => e.id === res).date
        );
        socket.emit("revision_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("revision_appointment_added_by_other_user");
      }
    });

    socket.on("send_usage_type", async (res) => {
      if (res === 1) {
        await calcAvailableRoadDates();
        sendMessage(socket, "ask_road_appointment_date", {
          from: "server",
          txt: availableRoadDates,
        });
      } else if (res === 2) {
        await calcAvailableOffroadDates();
        sendMessage(socket, "ask_offroad_appointment_date", {
          from: "server",
          txt: availableOffroadDates,
        });
      } else {
        await calcAvailableSportDates();
        sendMessage(socket, "ask_sport_appointment_date", {
          from: "server",
          txt: availableSportDates,
        });
      }
    });

    socket.on("send_road_appointment_date", async (res) => {
      if (availableRoadDates.some((e) => e.id === res)) {
        await saveNewRoadAppointment(
          await getNextRoadAppointmentId(),
          availableRoadDates.find((e) => e.id === res).date,
        );
        socket.emit("road_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("road_appointment_added_by_other_user");
      }
    });

    socket.on("send_offroad_appointment_date", async (res) => {
      if (availableOffroadDates.some((e) => e.id === res)) {
        await saveNewOffroadAppointment(
          await getNextOffroadAppointmentId(),
          availableOffroadDates.find((e) => e.id === res).date,
        );
        socket.emit("offroad_appointment_added", {
          from: "server",
          txt: "Votre rendez-vous a été sauvegardé !",
        });
        socket.broadcast.emit("offroad_appointment_added_by_other_user");
      }
    });

    socket.on("send_sport_appointment_date", async (res) => {
      if (availableSportDates.some((e) => e.id === res)) {
        await saveNewSportAppointment(
          await getNextSportAppointmentId(),
          availableSportDates.find((e) => e.id === res).date,
        );
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

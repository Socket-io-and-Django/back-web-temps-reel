const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');


const coolieParser = require('cookie-parser');
const path = require('path');
// const formatMessage = require('./utils/messages')
// const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');
const jwtSocketHandler = require('./middleware/jwtSocketHandler');
const jwtRouterHandler = require('./middleware/jwtRoutersHandler');
const credential = require('./middleware/credentials');
const corsOptions = require('./config/corsOptions');
const rolesList = require('./config/rolesList');
const verifyRoles = require('./middleware/verifyRoles');

const auth = require('./routers/auth');
const refresh = require('./routers/refresh');
const register = require('./routers/register');
const logout = require('./routers/logout');

const allUsers = require('./routers/users');
const mongodb = require('./db/mongo');

app.use(express.json());
app.use(credential);

app.use(cors(corsOptions));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// app.use(coolieParser);

app.use('/register', register);

app.use('/auth', auth);
app.use('/refresh', refresh);
app.use('/users', allUsers);

app.use(jwtRouterHandler);
app.use(verifyRoles(rolesList.Admin, rolesList.User));
app.use('/logout', logout);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
// const io = new Server(9000, { allowRequest: cors(corsOptions)});

const io = new Server(9000, {
  cors:{
    origin: 'http://localhost:8080'
  }
});
// io.use(cors(corsOptions));
io.use(jwtSocketHandler);
io.on("connection", (socket) => {
  console.log("on connection", socket.handshake.auth);
  socket.emit("token", socket.handshake.auth);
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

  const calcAvailableMaintenanceDates = () => {
    let nextAvailableMaintenanceId = 1;
    let today = new Date("2022-12-13");
    // let today = new Date();
    const currentDay = today.getDay();
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
      // TODO  choix date de rdv avec calendrier
      // const today = new Date("2022-12-16");
      // let today = new Date();
      // const currentDay = today.getDay();
      // for (let day = today.getDay(); day < 6; day++) {
      //   if (
      //     !maintenanceAppointments.some(
      //       (e) =>
      //         e.date.getDate() === addDays(today, day - currentDay).getDate()
      //     )
      //   ) {
      //     if (day > 0 && day < 6) {
      //       availableMaintenanceDates.push(addDays(today, day - currentDay));
      //     }
      //   }
      // }
      calcAvailableMaintenanceDates();
      if (availableMaintenanceDates.length) {
        sendMessage(socket, "ask_appointment_date", {
          from: "server",
          txt: availableMaintenanceDates,
        });
        console.log(availableMaintenanceDates);
      }
    } else {
      sendMessage(socket, "ask_km_since_last_maintenance", {
        from: "server",
        txt: "Saisir le nombre de kilomètres parcourus depuis le dernier entretien",
        vehiculeInfo,
      });
    }
  });

  socket.on("send_appointment_date", (res) => {
    console.log("before push");
    console.log("res : " + res);
    console.log(availableMaintenanceDates);
    console.log(maintenanceAppointments);
    console.log(availableMaintenanceDates.find((e) => e.id === res));
    if (availableMaintenanceDates.some((e) => e.id === res)) {
      maintenanceAppointments.push({
        id: nextMaintenanceId,
        date: availableMaintenanceDates.find((e) => e.id === res),
      });
      nextMaintenanceId += 1;
      console.log("after push");
      console.log(availableMaintenanceDates);
      console.log(maintenanceAppointments);
    }
    //   sendMessage(socket, "appointment_already_taken", {
    //     from: "server",
    //     txt: "Le rendez-vous n'est plus disponible, veillez choisir une autre date",
    //   });
    // } else {
    // }
    // if (res === 1) {
    //   // TODO demande rdv
    // } else {
    //   socket.emit("reset_chat");
    // }
  });

  socket.on("send_km_since_maintenance_date", (res) => {
    vehiculeInfo = {
      ...vehiculeInfo,
      kmSinceLastMaintenance: res,
    };
    if (vehiculeInfo.kmSinceLastMaintenance >= 10000) {
      // TODO rdv
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
    } else {
      socket.emit("reset_chat");
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

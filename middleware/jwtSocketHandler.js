const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
require('dotenv').config();

const jwtSocketHandler = (socket, next) => {
    const token = socket.handshake.auth.token;

    if(!token) {
        throw new Error("Unauthorized Client");
    }
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                throw new Error("Unauthorized Client");
            } // forbidden we received un valid token for exist user
            socket.handshake.auth.username = decoded.userInfo.username;
            socket.handshake.auth['roles'] = decoded.userInfo.roles;
        }
    );
    next();
}


module.exports = jwtSocketHandler;
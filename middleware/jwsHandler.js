const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
require('dotenv').config();

const jwtVerifyer = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader) return res.sendStatus(401);
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); // forbidden we received un valid token for exist user
            req.username = decoded.username;
            console.log(`req.username: ${req.username}`)
            next();
        }
    );
}

module.exports = jwtVerifyer;
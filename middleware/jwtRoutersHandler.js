const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
const coolieParser = require('cookie-parser');

const routerJwtVerifier = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization; // case sensitive
    if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); // forbidden we received un valid token for exist user
            req.username = decoded.userInfo.username;
            req.roles = decoded.userInfo.roles;
            next();
        }
    );
}

module.exports = routerJwtVerifier;

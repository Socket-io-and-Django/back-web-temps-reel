const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
const coolieParser = require('cookie-parser');

const routerJwtVerifier = (req, res, next) => {
    const token = req.body.accessToken;
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                console.log("err", err.message)
                return res.status(403).json('forbidden'); // forbidden we received un valid token for exist user

            }
            req.username = decoded.userInfo.username;
            req.roles = decoded.userInfo.roles;
            next();
        }
    );
}

module.exports = routerJwtVerifier;

const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");
const coolieParser = require('cookie-parser');

const routerJwtVerifier = (req, res, next) => {
    // const authHeader = req.headers.authorization || req.headers.Authorization; // case sensitive
    // if(!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    // console.log("authHeader ", authHeader);
    // const [title, token] = authHeader.split(' ');
    // console.log("token jwtHandler")
    // const n = token.length
    // console.log("token jwtHandler", token)
    const token = req.body.accessToken;
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) {
                console.log("err", err.message)
                return res.status(403).json('forb '); // forbidden we received un valid token for exist user

            }
            req.username = decoded.userInfo.username;
            req.roles = decoded.userInfo.roles;
            next();
        }
    );
}

module.exports = routerJwtVerifier;

const User = require('../model/User');
const jwt = require('jsonwebtoken');
// require('dotenv').config();

const refreshTokenHandler = async (req, res) =>  {
    const cookies = req.cookies;
    // if cookies , if jwt
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    // verify if username is existed
    const isExistUser = await User.findOne({refreshToken}).exec();
    if (!isExistUser) return res.sendStatus(403); // forbidden
    jwt.verify(
        refreshToken,
        process.env.REFESH_TOKEN_SECRET,
        (err, encoded) => {
            console.log(err);
            if(err || isExistUser.username !== encoded.username) return res.sendStatus(403);
            const accessToken = jwt.sign(
                {
                    "userInfo": {
                        "username": encoded.username,
                        "roles": Object.values(isExistUser.roles)
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: "1h"}
            );
            res.json({accessToken})
        }
    );

}
module.exports = { refreshTokenHandler };
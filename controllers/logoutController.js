const User = require('../model/User');
const jwt = require("jsonwebtoken");
const logoutHandler = async (req, res) => {

    // on client side must delete the accessToken either
    const token = req.body.accessToken;
    // console.log("in logout refreshToken", token.accessToken)

    // if cookies , if jwt
    if (!token) return res.sendStatus(204); // no content

    let username = '';
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err)
            {
                return res.sendStatus(403); // forbidden we received un valid token for exist user
            }

            username = decoded.userInfo.username;
        }
    );
    // verify if refreshToken is existed in the db
    const isExistUser = await User.findOne({username}).exec();
    if (!isExistUser) {
        res.clearCookie('jwt', {httpOnly: true});
        res.sendStatus(204);
    }
    // delete  the refreshToken from db
    isExistUser.refreshToken = '';
    const result = isExistUser.save();
    // res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true}) //to have https
    const emptyToken =
        {
            accessToken: ""
        };
    res.json(emptyToken);
}
module.exports = { logoutHandler };
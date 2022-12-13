const User = require('../model/User');
const logoutHandler = async (req, res) => {
    // on client side must delete the accessToken either
    const cookies = req.cookies;
    // if cookies , if jwt
    if (!cookies?.jwt) return res.sendStatus(204); // no content
    const refreshToken = cookies.jwt;
    // verify if refreshToken is existed in the db
    const isExistUser = await User.findOne({refreshToken}).exec();
    if (!isExistUser) {
        res.clearCookie('jwt', {httpOnly: true});
        res.sendStatus(204);
    }
    // delete  the refreshToken from db
    isExistUser.refreshToken = '';
    const result = isExistUser.save();
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true}) //to have https
    res.sendStatus(204);
}
module.exports = { logoutHandler };
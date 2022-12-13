const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// require('dotenv').config();
const loginHandler = async (req, res) =>  {
    console.log(req.body);
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({'message': 'Username and password are required!'});
    // verify if username is existed
    const isExistUser = await User.findOne({username: username}).exec();
    if (!isExistUser) return res.status(401).json({'message': 'Username or password is not correct!'});
    const match = await bcrypt.compare(password, isExistUser.password);
    if (match) {
        // here must create JWTs to be used with protected routes
        const accessToken = jwt.sign(
            {"username": isExistUser.username},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '1h'}
        );
        const refreshToken = jwt.sign(
            {"username": isExistUser.username},
            process.env.REFESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );
        isExistUser.refreshToken = refreshToken;
        const result = await isExistUser.save();
        // the Tokens must be stored in memory in the front
        // be attention to not store it in localstorage or any other cookie accessible by JS
        // that's why we use httpOnly cookie in this way the cookie is not accessible by JS
        res.cookie('jwt', refreshToken , {httpOnly: true,sameSite: 'None', secure: true, maxAge:  24 * 3600 * 1000})
        res.json({ accessToken });
    }else{
        res.status(401).json({'message': 'Username or password is not correct!'});
    }
}
module.exports = { loginHandler };
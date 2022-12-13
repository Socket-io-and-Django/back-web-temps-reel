const User = require('../model/User');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({'message': 'Username and password are required!'});
    // cheque if username are already exist
    const alreadyExist = await User.findOne({username: username}).exec();
    console.log(alreadyExist);
    if (alreadyExist) return res.status(409).json({'message': 'This username are already exist!'});
    try {
        // encrypting password
        const hashedPassword = await bcrypt.hash(password, 10);
        // store new user
        const newUser = new User({'username': username, 'password': hashedPassword});
        newUser.save().then(() => console.log('saved'));
        return res.status(201).json({'message': `${username} has been created !`});
    } catch (err) {
         res.status(500).json({'message': err.message});
    }
}

module.exports = { handleNewUser };
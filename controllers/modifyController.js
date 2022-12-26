const User = require('../model/User');
const modifyHandler = async (req, res) => {

    const {username, roles} = req.body;
    if (!username) return res.status(400).json({'message': 'Username is required!'});

    // verify if username is existed in the db
    const isExistUser = await User.findOne({username: username}).exec();
    if (!isExistUser) {
        return res.status(400).json({'message': 'this user is not exist!'});
    }

    isExistUser.roles = {...isExistUser.roles, roles};
    const result = await isExistUser.save();
    console.log(result)
    res.sendStatus(204);
}

module.exports = { modifyHandler };
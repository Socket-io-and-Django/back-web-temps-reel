const User = require('../model/User');
const {rolesList, getRole, getValue} = require('../config/rolesList');
const allUsers = async (req, res) =>  {

    const allUser = await User.find().select('-password').lean().exec();
    if (!allUser) return res.sendStatus(204);
    return res.json(allUser);

}

const userById = async (req, res) =>  {
    const id = req.body.id;
    if(!id) return res.status(400).json('id is required!');
    const user = await User.findById(id).select('-password').lean().exec();
    if (!user) return res.sendStatus(204);
    return res.json(user);

}
const allConsultants = async (req, res) =>  {
    const roleKey = 'Consultant';
    const rolesKey = `roles.${roleKey}`;
    const roles = {};
    roles[rolesKey] = getValue(roleKey);
    const allConsultantsList = await User.where(roles).select('-password').exec();
    if (!allConsultantsList) return res.sendStatus(204);
    return res.json(allConsultantsList);
}

const allAvailableConsultants = async (req, res) =>  {
    const roleKey = 'Consultant';
    const rolesKey = `roles.${roleKey}`;
    const roles = {};
    roles[rolesKey] = getValue(roleKey);
    const allConsultantsList = await User.find({}).select('-password').where(roles).where('available').equals(true).exec();
    if (!allConsultantsList) return res.sendStatus(204);
    return res.json(allConsultantsList);
}

// must be Admin exclusive
const allRoleUsers = async (req, res) =>  {
    const roleKey = getRole(req.body.role);

    if(!roleKey || !req.body.role) return res.status(400).json('This role is not accepted role!');
    const rolesKey = `roles.${roleKey}`
    const roles = {};
    roles[rolesKey] = req.body.role
    const allRoleUser = await User.where(roles).select('-password').exec();

    if (!allRoleUser) return res.sendStatus(204);
    return res.json(allRoleUser);
}

const modifyPropertyHandler = async (req, res) => {
    const {username, property} = req.body;
    if (!username || !property) return res.status(409).json({'message': 'Conflict!'});
    const key = Object.keys(property)[0]
    const value = property[key];
    if(!(key || value)) return res.status(409).json({'message': 'Conflict 1!'});
    // verify if username is existed in the db
    const isExistUser = await User.findOne({username: username}).select('-password').exec();
    if (!isExistUser) {
        return res.sendStatus(403)//.json({'message': 'this user is not exist!'});
    }
    isExistUser[key] = value;
    const result = await isExistUser.save();
    res.send(isExistUser);
}
const modifyRolesHandler = async (req, res) => {

    const {username, roles} = req.body;
    if (!username) return res.status(400).json({'message': 'Username is required!'});

    // verify if username is existed in the db
    const isExistUser = await User.findOne({username: username}).select('-password').exec();
    console.log(isExistUser)
    if (!isExistUser) {
        return res.status(400).json({'message': 'this user is not exist!'});
    }
    isExistUser.roles = {...isExistUser.roles, ...roles};
    const result = await isExistUser.save();
    res.send(isExistUser);
}


module.exports = { allUsers , userById, allRoleUsers, allConsultants, allAvailableConsultants, modifyRolesHandler, modifyPropertyHandler };
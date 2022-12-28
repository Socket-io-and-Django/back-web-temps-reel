const rolesList = {
    "Admin": 424242,
    "Consultant": 4242,
    "User": 42,
}
function getRole(role) {
    return Object.keys(rolesList).find(key => rolesList[key] === role);
}
function getValue(role) {
    return rolesList[role];
}

module.exports = { rolesList, getRole, getValue };
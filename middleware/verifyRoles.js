const verifyRoles = (...acceptedRoles) => {
    return (req, res, next) => {
        console.log(req.roles)
        // if(!req?.roles) return res.sendStatus(401);
        const roles = [...acceptedRoles];
        const result = req.roles.map(role => roles.includes(role)).find(value => value === true);
        console.log("roles", roles, "user roles:", req.roles)
        if(!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles;
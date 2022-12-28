const express = require('express');
const router = express.Router();
const usresController = require('../controllers/usersControllers');

router.get('/', usresController.allUsers);
router.get('/user', usresController.userById);
router.get('/consultants', usresController.allConsultants);
router.get('/consultants/available', usresController.allAvailableConsultants);



// must be Admin exclusive
router.patch('/role', usresController.modifyRolesHandler);

router.patch('/property', usresController.modifyPropertyHandler);

router.get('/roles', usresController.allRoleUsers);


module.exports = router;
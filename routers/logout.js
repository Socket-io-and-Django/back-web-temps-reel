const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/logoutController');

router.post('/', logoutController.logoutHandler);

module.exports = router;
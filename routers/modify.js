const express = require('express');
const router = express.Router();
const modifyController = require('../controllers/modifyController');

router.patch('/', modifyController.modifyHandler);

module.exports = router;
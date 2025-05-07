const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const authController = require('../Controllers/authcontroller');

router.post('/send', authController.protect, userController.sendContactEmail);

module.exports = router;
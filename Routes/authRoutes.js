const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);

// Profile routes (protected)
router.get('/profile', authController.protect, authController.getProfile);
router.patch('/profile', authController.protect, authController.updateProfile);

module.exports = router;
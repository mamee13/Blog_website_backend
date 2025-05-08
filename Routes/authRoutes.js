const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController'); // Fix the casing here

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile routes (protected)
router.get('/profile', authController.protect, authController.getProfile);
router.patch('/profile', authController.protect, authController.updateProfile);
router.patch('/update-password', authController.protect, authController.updatePassword);

module.exports = router;
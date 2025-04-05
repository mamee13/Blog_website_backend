const express = require('express');
const Post = require('../Models/postModel');
const postController = require('../Controllers/postController');
const { protect } = require('../Controllers/authController');

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);

// Protected routes - require authentication
router.get('/:id', protect, postController.getPost);
router.post('/', protect, postController.createPost);
router.post('/:id', protect, postController.createComment);

module.exports = router;
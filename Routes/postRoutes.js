const express = require('express');
const postController = require('../Controllers/postController');
const { protect } = require('../Controllers/authController');

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPost);

// Protected routes
router.post('/', protect, postController.uploadPostImage, postController.createPost);
router.patch('/:id', protect, postController.uploadPostImage, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments', protect, postController.createComment);

module.exports = router;
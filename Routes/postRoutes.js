const express = require('express');
const postController = require('../Controllers/postController');
const { protect } = require('../Controllers/authcontroller');  // Updated casing
const userController = require('../Controllers/userController');

const router = express.Router();

// Public routes
router.get('/', postController.getPosts);

// Create new post route (add this)
router.post('/', protect, postController.uploadPostImage, postController.createPost);

// Bookmark routes (place these BEFORE the :id routes)
router.get('/bookmarks', protect, userController.getBookmarks);
router.post('/:postId/bookmark', protect, userController.toggleBookmark);

// Post routes with ID parameter
router.get('/:id', protect, postController.getPost);
router.patch('/:id', protect, postController.uploadPostImage, postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/comments', protect, postController.createComment);

// Like/Dislike routes
router.post('/:postId/like', protect, postController.toggleLike);
router.get('/:postId/likes', postController.getLikes);

module.exports = router;
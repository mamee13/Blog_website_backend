const express = require('express');
const Post = require('../Models/postModel');
const postController = require('../Controllers/postController');

const router = express.Router();

router.route('/').get(postController.getPosts).post(postController.createPost);
router.route('/:id').get(postController.getPost).post(postController.createComment);

module.exports = router;
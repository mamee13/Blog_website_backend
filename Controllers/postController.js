const Post = require('../Models/postModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

exports.createPost = catchAsync(async (req, res, next) => {
    const { title, content, tags } = req.body;
    const post = new Post({ title, content, tags, author: req.userId });
    await post.save();
    res.status(201).json(post);
});

exports.getPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find().populate('author', 'username');
    res.json(posts);
});

exports.getPost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) {
        return next(new AppError('Post not found', 404));
    }
    res.json(post);
});

exports.createComment = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new AppError('Post not found', 404));
    }
    post.comments.push({ text: req.body.text, user: req.userId });
    await post.save();
    res.status(201).json(post);
});

// Remove this as it seems to be misplaced Express route handler
// It should be in the routes file instead
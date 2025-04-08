const Post = require('../Models/postModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const multer = require('multer');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/posts');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `post-${uniqueSuffix}.${file.mimetype.split('/')[1]}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

exports.uploadPostImage = upload.single('image');

exports.createPost = catchAsync(async (req, res, next) => {
    const { title, content, tags, category } = req.body;
    
    const postData = {
        title,
        content,
        tags,
        category,
        author: req.user._id
    };

    if (req.file) {
        postData.image = `/images/posts/${req.file.filename}`;
    }

    const post = new Post(postData);
    await post.save();
    
    res.status(201).json({
        status: 'success',
        data: {
            post
        }
    });
});

// New update post function
exports.updatePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to update this post', 403));
    }

    const { title, content, tags, category } = req.body;
    
    // Update image if new one is uploaded
    if (req.file) {
        post.image = `/images/posts/${req.file.filename}`;
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.category = category || post.category;
    
    await post.save();

    res.json({
        status: 'success',
        data: {
            post
        }
    });
});

// New delete post function
exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    // Check if user is author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this post', 403));
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
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
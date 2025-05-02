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
    post.comments.push({ text: req.body.text, user: req.user._id });
    await post.save();

    const updatedPost = await Post.findById(post._id)
        .populate('author', 'username')
        .populate('comments.user', 'username');

    res.status(201).json(updatedPost);
});

// Delete a comment
exports.deleteComment = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
        return next(new AppError('Comment not found', 404));
    }

    // Check if user is comment author or admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this comment', 403));
    }

    // Remove the comment
    post.comments.pull({ _id: req.params.commentId });
    await post.save();

    // Fetch updated post with populated fields
    const updatedPost = await Post.findById(post._id)
        .populate('author', 'username')
        .populate('comments.user', 'username');

    // Return the updated post instead of 204 status
    res.status(200).json({
        status: 'success',
        data: updatedPost
    });
});

// Remove this as it seems to be misplaced Express route handler
// It should be in the routes file instead

// Toggle like/dislike on a post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        // Check if user has already liked/disliked
        const existingLike = post.likes.find(
            like => like.user.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // If same type, remove the like/dislike
            if (existingLike.type === req.body.type) {
                post.likes = post.likes.filter(
                    like => like.user.toString() !== req.user._id.toString()
                );
            } else {
                // If different type, update the type
                existingLike.type = req.body.type;
            }
        } else {
            // Add new like/dislike
            post.likes.push({
                user: req.user._id,
                type: req.body.type
            });
        }

        await post.save();

        res.status(200).json({
            status: 'success',
            data: {
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get likes for a post
exports.getLikes = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('likes.user', 'username');

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Post not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                likes: post.likes,
                likesCount: post.likesCount,
                dislikesCount: post.dislikesCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Add after getLikes function

// Get bookmarks for a post
exports.getBookmarks = catchAsync(async (req, res) => {
    const posts = await Post.find({
        'bookmarks.user': req.user._id
    }).populate('author', 'username');

    res.status(200).json({
        status: 'success',
        bookmarks: posts
    });
});

// Toggle bookmark on a post
exports.toggleBookmark = catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        return next(new AppError('Post not found', 404));
    }

    // Check if user has already bookmarked
    const existingBookmark = post.bookmarks.find(
        bookmark => bookmark.user.toString() === req.user._id.toString()
    );

    if (existingBookmark) {
        // Remove bookmark if it exists
        post.bookmarks = post.bookmarks.filter(
            bookmark => bookmark.user.toString() !== req.user._id.toString()
        );
    } else {
        // Add new bookmark
        post.bookmarks.push({
            user: req.user._id
        });
    }

    await post.save();

    res.status(200).json({
        status: 'success',
        data: {
            isBookmarked: !existingBookmark,
            bookmarkCount: post.bookmarkCount
        }
    });
});
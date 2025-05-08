const User = require('../Models/userModel');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const createTransporter = require('../Utils/emailConfig');

exports.toggleBookmark = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const bookmarkIndex = user.bookmarks.findIndex(
        bookmark => bookmark.post.toString() === postId
    );

    if (bookmarkIndex > -1) {
        // Remove bookmark if exists
        user.bookmarks.splice(bookmarkIndex, 1);
    } else {
        // Add new bookmark
        user.bookmarks.push({ post: postId });
    }

    await user.save();

    res.status(200).json({
        status: 'success',
        message: bookmarkIndex > -1 ? 'Bookmark removed' : 'Post bookmarked',
        data: {
            bookmarks: user.bookmarks
        }
    });
});

exports.getBookmarks = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
        path: 'bookmarks.post',
        select: 'title content author createdAt'
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            bookmarks: user.bookmarks
        }
    });
});

exports.sendContactEmail = catchAsync(async (req, res, next) => {
    const { message } = req.body;
    const user = req.user;

    if (!message) {
        return next(new AppError('Message is required', 400));
    }

    try {
        const transporter = await createTransporter();
        
        if (!transporter) {
            return next(new AppError('Email service not available', 500));
        }

        const mailOptions = {
            from: `${user.username} <${user.email}>`,
            to: 'mamaruyirga1394@gmail.com',
            subject: `Contact Message from ${user.username}`,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>From:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: 'Message sent successfully'
        });
    } catch (error) {
        console.error('Email error:', error);
        return next(new AppError('Failed to send message', 500));
    }
});
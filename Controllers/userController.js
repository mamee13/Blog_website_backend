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
            from: `"Blog Website" <${user.email}>`,
            to: 'mamaruyirga1394@gmail.com',
            subject: `Contact Message from ${user.username}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Contact Message</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                        }
                        .email-container {
                            border: 1px solid #e0e0e0;
                            border-radius: 5px;
                            overflow: hidden;
                        }
                        .email-header {
                            background-color: #4a6da7;
                            color: white;
                            padding: 20px;
                            text-align: center;
                        }
                        .email-body {
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .email-footer {
                            background-color: #f1f1f1;
                            padding: 15px;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                        }
                        .message-content {
                            background-color: white;
                            padding: 15px;
                            border-radius: 4px;
                            border-left: 4px solid #4a6da7;
                            margin-top: 15px;
                        }
                        .user-info {
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #e0e0e0;
                        }
                        .timestamp {
                            color: #888;
                            font-size: 12px;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>New Contact Message</h1>
                        </div>
                        <div class="email-body">
                            <div class="user-info">
                                <p><strong>From:</strong> ${user.username}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p class="timestamp">Sent on: ${new Date().toLocaleString()}</p>
                            </div>
                            <h3>Message:</h3>
                            <div class="message-content">
                                <p>${message.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                        <div class="email-footer">
                            <p>This message was sent from your Blog Website contact form.</p>
                            <p>&copy; ${new Date().getFullYear()} Blog Website. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                New Contact Message
                
                From: ${user.username}
                Email: ${user.email}
                Sent on: ${new Date().toLocaleString()}
                
                Message:
                ${message}
                
                This message was sent from your Blog Website contact form.
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
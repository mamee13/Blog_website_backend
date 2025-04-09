const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const { sendVerificationEmail } = require('../Utils/email');

exports.register = catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        passwordConfirm,
        verificationCode,
        verificationCodeExpires,
        isVerified: false
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
        status: 'success',
        message: 'Verification code sent to your email'
    });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({
        email,
        verificationCode,
        verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Invalid or expired verification code', 400));
    }

    // Update user
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
        token
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Invalid credentials', 401));
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        }
    });
});
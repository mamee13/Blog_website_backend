const User = require('../Models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');
const { sendVerificationEmail } = require('../Utils/email');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
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
    const token = signToken(user._id);

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

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Check if user is verified
    if (!user.isVerified) {
        return next(new AppError('Please verify your email first', 401));
    }

    // Generate token
    const token = signToken(user._id);

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

exports.protect = catchAsync(async (req, res, next) => {
    // Get token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Grant access to protected route
    req.user = user;
    next();
});
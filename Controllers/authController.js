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

    try {
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
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
    } catch (error) {
        return next(new AppError('Failed to send verification email', 500));
    }
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

    // When sending the response, make sure to:
    res.status(200)
        .cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })
        .json({
            status: 'success',
            token,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
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
        return res.status(401).json({
            status: 'error',
            message: 'You are not logged in. Please log in to get access'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists'
            });
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token or token expired'
        });
    }
});


// Get current user's profile
exports.getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password -verificationCode -verificationCodeExpires');
    if (!user) {
        return next(new AppError('User not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// Update current user's profile
exports.updateProfile = catchAsync(async (req, res, next) => {
    // Only allow updating certain fields
    const allowedFields = ['username', 'email'];
    const updates = {};
    allowedFields.forEach(field => {
        if (req.body[field]) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
        select: '-password -verificationCode -verificationCodeExpires'
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});
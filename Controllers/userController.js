const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/AppError');

exports.register = catchAsync(async (req, res, next) => {
    const { username, email, password, passwordConfirm } = req.body;

    // Check if user already exists - with logging
    const existingUser = await User.findOne({ email });
    console.log('Checking email:', email);
    console.log('Existing user:', existingUser);

    if (existingUser) {
        return next(new AppError('Email already in use', 400));
    }

    // Validate password confirmation
    if (!passwordConfirm) {
        return next(new AppError('Please confirm your password', 400));
    }

    if (password !== passwordConfirm) {
        return next(new AppError('Passwords do not match', 400));
    }

    // Create new user with role
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        passwordConfirm: passwordConfirm,
        role: 'user'  // explicitly set role to 'user' for new registrations
    });

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        }
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
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot be more than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'author'], 
        default: 'user' 
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false
    },
    passwordConfirm: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    bookmarks: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'post' 
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// Remove passwordConfirm field before saving
userSchema.pre('save', function(next) {
    this.passwordConfirm = undefined;
    
    // If password was modified, set passwordChangedAt
    if (this.isModified('password')) {
        this.passwordChangedAt = Date.now() - 1000;
    }
    next();
});

// After schema definition, before model creation
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
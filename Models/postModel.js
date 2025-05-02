const { json } = require("express");
const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'A post must have content']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
    },
    category: {
        type: String,
        required: [true, 'A post must have a category'],
        enum: ['Technology', 'Travel', 'Food', 'Sport', 'Lifestyle', 'Other']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String
    }],
    comments: [{
        text: {
            type: String,
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Added likes system
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        type: {
            type: String,
            enum: ['like', 'dislike'],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Virtual fields for like counts
    likesCount: {
        type: Number,
        default: 0
    },
    dislikesCount: {
        type: Number,
        default: 0
    },
    bookmarks: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    bookmarkCount: {
        type: Number,
        default: 0
    }

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

// Update the updatedAt timestamp on save
postSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate likes and dislikes before saving
postSchema.pre('save', function (next) {
    this.likesCount = this.likes.filter(like => like.type === 'like').length;
    this.dislikesCount = this.likes.filter(like => like.type === 'dislike').length;
    next();
});

// Add this after the likes calculation middleware
postSchema.pre('save', function (next) {
    this.bookmarkCount = this.bookmarks.length;
    next();
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;
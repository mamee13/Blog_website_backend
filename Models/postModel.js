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
        enum: ['Technology', 'Travel', 'Food', 'Sport','Lifestyle', 'Other']
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
    }]
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Update the updatedAt timestamp on save
postSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;
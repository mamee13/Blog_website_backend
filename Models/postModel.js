const { json } = require("express");
const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
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
            type: Date, default: Date.now
         }
    }],
},
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    },
);

const Post = mongoose.model('post', postSchema);

module.exports = Post;
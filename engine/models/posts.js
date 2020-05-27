const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    content: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: false
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
        }
    ],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
},
{ timestamps: true }

);

module.exports = mongoose.model('Post', postSchema)
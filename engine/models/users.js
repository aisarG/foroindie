const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    reputation: {
        type: Number,
        required: true,
        default: 1
    },
    posts: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
],
    comments: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
        }
    ]
}
)

module.exports = mongoose.model('User', userSchema);
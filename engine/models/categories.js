const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: {
        type: String,
        default: 'WIP',
        required: true,
    },
    postCount: {
        type: Number,
        default: 0,
        required: true
    },
    commentCount: {
        type: Number,
        default: 0,
        required: true
    },
},
{ timestamps: true }

);

module.exports = mongoose.model('Category', categorySchema)
const Post = require('../models/posts');
const Comment = require('../models/comments');
const User = require('../models/users');
const { errorHandler } = require('../util/errorHandler');

exports.postComment = (req, res, next) => {
    const postId = req.params.postId;
    const content = req.body.comment;
    let comment;
    let post;
    
    Post.findById(postId)
    .then(result => {
        post = result;

        if (![post]) {
            errorHandler(404, 'Post not found')
        }
        const comment = new Comment({
            content: content,
            userId: req.userId,
            postId: post._id
        })
        return comment.save()

    })
    .then(result => {
        comment = result;
        post.comments.push(comment._id)
        return post.save()
    })
    .then(result => {
        return User.findById(req.userId)
    })
    .then(user => {
        if (!user) {
            errorHandler(404, 'User not found')
        }
        user.comments.push(comment._id)
        return user.save()
    })
    .then(result => {
        res.status(200).json({
            _id: comment._id,
            userId: {_id: req.userId, name: req.name},
            content: comment.content
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getComments = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).populate({
        path: 'comments',
        populate: {
            path: 'userId',
            select: 'name'
        },
    })
    .then(comments => {
        if (!comments) {
            errorHandler(404, "Post doesn't exists")
        }
        res.status(200).json({ 
            comments: comments.comments })
    }
    )
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getComment = (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findById(commentId).select('_id content')
    .then(comment => {
        if (!comment) {
            errorHandler(404, 'No comment has found')
        }
        res.status(200).json({
            comment: comment
        })

    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.editComment = (req, res, next) => {
    const commentId = req.params.commentId
    const commentContent = req.body.content
    Comment.findById(commentId)
    .then(comment => {
        if (!comment) {
            errorHandler(404, 'No comment has found')
        }
        if (comment.userId.toString() !== req.userId.toString()) {
            errorHandler(403, 'User not allowed to do that')
        }
        comment.content = commentContent;
        return comment.save()
    })
    .then(comment => {
        res.status(201).json({
            _id: comment._id,
            userId: {_id: req.userId, name: req.name},
            content: comment.content
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deleteComment = (req, res, next) => {
    const commentId = req.params.commentId;
    Comment.findById(commentId)
    .then(comment => {
        if (!comment) {
            errorHandler(404, 'No comment has found')
        }
        if (comment.userId.toString() !== req.userId.toString()) {
            errorHandler(403, 'User not allowed to do that')
        }

        return comment.deleteOne()
    })
    .then(comment => {
        return Post.findById(comment.postId)
    })
    .then(post => {
        if (!post) {
            errorHandler(404, 'We cannot found the post')
        }
        post.comments.pull(commentId);
        return post.save()
    })
    .then(post => {
        return User.findById(req.userId)
    })
    .then(user => {
        if (!user) {
            errorHandler(404, 'No user has found')
        }
        user.comments.pull(commentId);
        return user.save()
    })
    .then(result => {
        res.status(201).json({ _id: commentId })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
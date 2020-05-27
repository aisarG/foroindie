const Post = require('../models/posts');
const User = require('../models/users');
const Comment = require('../models/comments');
const Category = require('../models/categories');
const { validationResult } = require('express-validator');
const io = require('../socket');
const path = require('path');
const fs = require('fs');
const { errorHandler } = require('../util/errorHandler');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 8;
    let totalPost;

    Post.find()
    .countDocuments()
    .then(totalCount => {
        totalPost = totalCount;

        return Post.find().populate('userId', 'name').select('title url userId createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
        res.status(200).json({ posts: posts, totalItems: totalPost})
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getCategoryPosts = (req, res, next) => {
    const categorySlug = req.params.categorySlug;
    const currentPage = req.query.page || 1;
    const perPage = 8;
    let category;
    let totalPost;

    Category.findOne({ slug: categorySlug })
    .then(result => {
        if (!result) {
            errorHandler(404, 'Category not found')
        }

        category = result

        return Post.find({ category: category._id })
        .countDocuments()
    })
    .then(totalCount => {
        totalPost = totalCount;


        return Post.find({ category: category._id }).populate('userId', 'name').select('title url userId createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
        res.status(200).json({ posts: posts, totalItems: totalPost })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })

}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errorHandler(422, null, errors)
    }
    const title = req.body.title;
    const content = req.body.content;
    const url = req.body.url;
    let category = req.body.category;
    let post;
    let imageUrl;

    if (req.file) {
        imageUrl = req.file.path;
    } else {
        imageUrl = 'undefined'
    }

    Category.findOne({ title: category })
    .then(result => {
        if (!result) {
            errorHandler(404, 'Category not found')
        }

        category = result._id

        post = new Post({
            title: title,
            content: content,
            url: url,
            imageUrl: imageUrl,
            userId: req.userId,
            category: category
        })
    
        return post.save()
    })
    .then(post => {
        return User.findById(req.userId)
    })
    .then(user => {
        creator = user
        user.posts.push(post)
        return user.save()
    })
    .then(user => {
        return io.getIO().emit('posts', {
            action: 'create',
            post: { ...post._doc, userId: { _id: req.userId, name: user.name } }
          });
    })
    .then(result => {
        res.status(201).json({
            message: 'Post created succesfully',
            post: { ...post._doc, userId: { _id: req.userId, name: creator.name } }
        })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).populate('userId', 'name')
    .select('title url imageUrl content userId createdAt updatedAt')
    .then(post => {
        if (!post) {
            errorHandler(404, 'Post not found')
        }
        res.status(200).json({ 
            post: post })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.editPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errorHandler(422, null, errors)
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const url = req.body.url;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path
    }

    if (!imageUrl) {
        errorHandler(422, 'No image found')
    }

    Post.findById(postId)
    .populate('userId', 'name')
    .then(post => {
        if (!post) {
            errorHandler(404, 'No post found')
        }

        if (post.userId._id.toString() !== req.userId.toString()) {
            errorHandler(403, 'User not allowed to do that')
        }

        if (imageUrl !== post.imageUrl) {
            const filePath = path.join(__dirname, '..', post.imageUrl);
            fs.unlink(filePath, err => console.log(err));
        }

        post.title = title;
        post.url = url;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();

    })
    .then(result => {
         io.getIO().emit('posts', {
            action: 'update',
            post: result
          });
          res.status(200).json({ post: result })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if (!post) {
            errorHandler(404, 'Post not found')
        }

        if (post.userId.toString() !== req.userId) {
            errorHandler(403, 'User not allowed to do that')
        }

        if (post.imageUrl !== 'undefined') {
            const filePath = path.join(__dirname, '..', post.imageUrl);
            fs.unlink(filePath, err => console.log(err));
        }

        return post.deleteOne()
    })
    .then(post => {
        return Comment.find({_id: post.comments})
    })
    .then(result => {
        comments = result
        return Comment.deleteMany({_id: result})
    })
    .then(comments => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save()
    })
    .then(result => {
        io.getIO().emit('posts', {
            action: 'delete',
            post: result
          });
        res.status(200).json({ message: 'Post has deleted' })
    })
    .catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
const express = require('express');
const { check } = require('express-validator');
const feedControllers = require('../controllers/feed')
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// GET posts
router.get('/posts', feedControllers.getPosts);

// GET category posts
router.get('/posts/:categorySlug', feedControllers.getCategoryPosts);

// create post
router.post('/posts', isAuth, [ 
    check('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title need to be at least 5 characters'), 
    check('content')
    .trim(),
    check('url')
    .if(check('url')
    .notEmpty())
    .isURL()
    .withMessage('Please enter a valid URL')
], 
    feedControllers.createPost);

// get a post
router.get('/post/:postId', feedControllers.getPost);

// edit a post
router.put('/post/:postId', isAuth, [ 
    check('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Title need to be at least 5 characters'), 
    check('content')
    .trim(),
    check('url')
    .if(check('url')
    .notEmpty())
    .isURL()
    .withMessage('Please enter a valid URL') ], 
    feedControllers.editPost);

// delete a post
router.delete('/post/:postId', isAuth, feedControllers.deletePost);

module.exports = router;
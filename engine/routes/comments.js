const express = require('express');
const commentController = require('../controllers/comments')
const isAuth = require('../middleware/is-auth');
const router = express.Router();

// post a comment
router.post('/comments/:postId', isAuth, commentController.postComment);

// get a comment
router.get('/comment/:commentId', commentController.getComment);

// get comments
router.get('/comments/:postId', commentController.getComments);

// edit a comment
router.put('/comment/:commentId', isAuth, commentController.editComment);

// delete a comment
router.delete('/comment/:commentId', isAuth, commentController.deleteComment);

module.exports = router;
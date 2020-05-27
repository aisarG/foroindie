const express = require('express');
// const { check } = require('express-validator');
const categoryControllers = require('../controllers/categories')
// const isAuth = require('../middleware/is-auth');
const router = express.Router();

// post a category
router.post('/category', categoryControllers.createCategory);

// get all categories
router.get('/category', categoryControllers.getCategories);

module.exports = router;
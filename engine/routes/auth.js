const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth')
const User = require('../models/users');
// const isAuth = require('../middleware/is-auth');
const router = express.Router();

// sign up
router.post('/register', [ 
    check('email')
    .isEmail()
    .trim()
    .normalizeEmail()
    .custom((value, {req}) => {
        return User.findOne({ email: value })
        .then(user => {
            if (user) {
                return Promise.reject('Email already exists');
            }
        })
    } ), 
    check('password')
    .trim()
    .isLength({ min: 5 }), 
    check('name')
    .trim()
    .not()
    .isEmpty() ], 
    authController.createUser);

// login
router.post('/login', authController.login);

module.exports = router;
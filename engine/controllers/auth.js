const User = require('../models/users');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../util/errorHandler');

exports.createUser = (req, res, next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errorHandler(422, 'Invalid Input')
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const reputation = req.body.reputation;

    bcrypt.hash(password, 12)
    .then(hashPw => {
        const user = new User({
            email: email,
            password: hashPw,
            name: name,
            reputation: reputation
        })

        return user.save()
    })
    .then(result => {
        res.status(201).json({
            message: 'User created succesfully',
            user: result._id
        })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })

}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
      .then(user => {
        if (!user) {
          errorHandler(401, 'A user with this email could not be found.')
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
      })
      .then(isEqual => {
        if (!isEqual) {
          errorHandler(401, 'Wrong password')
        }
        const token = jwt.sign(
          {
            name: loadedUser.name,
            userId: loadedUser._id.toString()
          },
          'somesupersecretsecret',
          { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  };
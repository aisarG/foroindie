const User = require('../models/users');

exports.increaseRep = (req, res, next) => {
    const userId = req.params.userId;
    const userRep = req.body.userRep;
    let incRep;
    if (userRep >= 1 && userRep <= 9) {
        incRep = 1
    }
    if (userRep >= 10 && userRep <= 59) {
        incRep = 3
    }
    if (userRep >= 60 && userRep <= 99) {
        incRep = 5
    }
    if (userRep >= 100) {
        incRep = 8
    }

    User.findById(userId)
    .then(user => {
        user.reputation += incRep
        return user.save()
    })
    .then(result => {
        res.status(201).json({ message: 'Reputation updated' })
    })
    .catch(err => {
        console.log(err)
    })
}
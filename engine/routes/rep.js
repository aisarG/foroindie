const express = require('express');

const router = express.Router();

const repController = require('../controllers/rep')

router.post('/reputation/:userId', repController.increaseRep);

module.exports = router;
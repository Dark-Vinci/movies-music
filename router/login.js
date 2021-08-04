const express = require('express');

const router = express.Router();

const { User, validateLogin } = require('../model/user');

router.post('/', async (req, res) => {
    
});

module.exports = router
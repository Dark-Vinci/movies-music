const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { User, validate } = require('../model/user');
const bodyValidator = require('../middlewares/bodyValidator');

router.post('/',bodyValidator(validate), async (req, res) => {
    let { firstName, lastName, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({
            status: 400,
            message: 'a user already exist with the same email'
        });
    } else {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        user = new User({
            email,
            firstName,
            lastName,
            password
        });

        await user.save();

        const token = user.generateToken();
        const toSend = _.pick(user, ['email', '_id', 'firstName', 'lastName']);

        res.header('x-auth-token', token)
            .status(201).json({
                status: 201,
                message: 'success', 
                data: toSend
            })
    }
})

module.exports = router;
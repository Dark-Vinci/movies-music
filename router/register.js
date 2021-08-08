const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { User, validate } = require('../model/user');
const wrapper = require('../middlewares/wrapper');
const bodyValidator = require('../middlewares/bodyValidator');

/* 
    TO REGISTER USERS INTO THE APPLICATION WITH EMAIL,
    PASSWORD, FIRSTNAME, LASTNAME
 */

    // route handler for registering new user
router.post('/', bodyValidator(validate), wrapper ( async (req, res) => {
    let { firstName, lastName, email, password } = req.body;

    // check if theres a user with same email in the db
    let user = await User.findOne({ email });

    if (user) {
        // if the theres a user with same email, a 400 response should be sent
        return res.status(400).json({
            status: 400,
            message: 'a user already exist with the same email'
        });
    } else {
        // hashing of the password
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        user = new User({
            email,
            firstName,
            lastName,
            password
        });

        // saving the user
        await user.save();

        // generate auth token
        const token = user.generateToken();
        const toSend = _.pick(user, ['email', '_id', 'firstName', 'lastName']);

        res.header('x-auth-token', token)
            .status(201).json({
                status: 201,
                message: 'success', 
                data: toSend
            }
        )
    }
}));

module.exports = router;
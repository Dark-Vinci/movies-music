const express = require('express');
const bcrypt = require('bcrypt');

const bodyValidator = require('../middlewares/bodyValidator');
const { User, validateLogin } = require('../model/user');
const wrapper = require('../middlewares/wrapper');

const router = express.Router();
/* 
    LOGGING IN A USER WITH EMAIL AND PASSWORD
 */

//route handler for for logging in new user
router.post('/', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // if a user doesnt exist in the db with same email, a 404 response should be sent
        return res.status(400).json({
            status: 400,
            message: 'invalid email or password'
        });
    } else {
        // comparing the sent password and the users password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            // for an invalid sent password
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            });
        } else {
            // generate an auth tokrn and send as reponse
            const token = user.generateToken();

            res.header('x-auth-token', token)
                .status(200).json({
                status: 200,
                message: 'success',
                data: `welcome back user ${ user.fullName }`
            });
        }
    }
}));

module.exports = router
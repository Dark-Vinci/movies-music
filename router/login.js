const express = require('express');
const bcrypt = require('bcrypt');

const bodyValidator = require('../middlewares/bodyValidator');
const { User, validateLogin } = require('../model/user');

const router = express.Router();

router.post('/', bodyValidator(validateLogin), async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'invalid email or password'
        });
    } else {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            });
        } else {
            const token = user.generateToken();

            res.header('x-auth-token', token)
                .status(200).json({
                status: 200,
                message: 'success',
                data: 'welcome back user'
            });
        }
    }
});

module.exports = router
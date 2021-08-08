const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // get the token form the resuest header
    const token = req.header('x-auth-token');

    if (!token) {
        // when no token is provided, terminate req
        return res.status(401).json({
            status: 401,
            message: 'no token provided'
        });
    } else {
        try {
            // verify the token and pass control to the next middleware if valid
            const decoded = jwt.verify(token, config.get('jwtPass'));
            req.user = decoded;
            next();
        } catch (ex) {
            // invalid token, terminate request
            return res.status(400).json({
                status: 400,
                message: 'invalid token provided'
            });
        }
    }
}
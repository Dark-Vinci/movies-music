const winston = require('winston');

module.exports = function (err, req, res, next) {
    winston.error(err);
    
    return res.status(500).json({
        status: 500,
        message: 'something went wrong on the server, try again laster'
    });
}
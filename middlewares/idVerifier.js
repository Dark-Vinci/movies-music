const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    const isValid = mongoose.Types.ObjectId.isValid;
    const q = req.id;

    if (!isValid(q)) {
        return res.status(404).json({
            status: 404,
            message: 'invalid request id'
        });
    } else {
        next();
    }
}
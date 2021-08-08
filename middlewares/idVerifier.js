const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    // get the id of the req
    const isValid = mongoose.Types.ObjectId.isValid;
    const q = req.params;
    const id = q.id || q.postId || q.userId || q.adminId;

    if (!isValid(id)) {
        // wrong/invalid object id
        return res.status(404).json({
            status: 404,
            message: 'invalid request id'
        });
    } else {
        // valid object Id, control is passed to next middleware
        next();
    }
}
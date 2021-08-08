

module.exports = function (req, res, next) {
    const user = req.user;

    if (!user.isAdmin) {
        // when the user is not an admin
        return res.status(403).json({
            status: 403,
            message: 'unauthorised, dont try again'
        });
    } else {
        // the user is an admin, request process is passed to
        // the next middleware in the req, res pipeline
        next();
    }
}
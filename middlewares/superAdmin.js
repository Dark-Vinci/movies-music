

module.exports = function (req, res, next) {
    // extracting the power of the users req.
    const power = req.user.power;

    if (!power) {
        // not a superadmin
        return res.status(403).json({
            status: 403,
            message: 'unauthorised, dont try again, oga go kill you'
        });
    } else {
        // a superadmin, control is passed to next middleware
        next();
    }
}
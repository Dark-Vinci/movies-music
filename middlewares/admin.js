

module.exports = function (req, res, next) {
    const user = req.user;

    if (!user.power) {
        return res.status(403).json({
            status: 403,
            message: 'unauthorised, dont try again'
        });
    } else {
        next();
    }
}
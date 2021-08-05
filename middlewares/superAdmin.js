

module.exports = function (req, res, next) {
    const power = req.user.power;
    if (power) {
        return res.status(403).json({
            status: 403,
            message: 'unauthorised, dont try again, oga go kill you'
        });
    } else {
        next();
    }
}
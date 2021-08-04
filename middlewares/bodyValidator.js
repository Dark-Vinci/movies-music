
module.exports = function(validator) {
    return (req, res, next) => {
        const { error } = validator(req.body);

        if (error) {
            return res.status(404).json({
                status: 404,
                message: 'invalid request id'
            });
        } else {
            next();
        }
    }
}
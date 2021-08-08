
module.exports = function(validator) {
    return (req, res, next) => {
        const { error } = validator(req.body);
        
        if (error) {
            // error in the req, res processing pipeline, 
            //  req is terminated
            return res.status(400).json({
                status: 400,
                message: error.details[0].message
            });
        } else {
            // no error, control is passed to the next middle in pipeline
            next();
        }
    }
}
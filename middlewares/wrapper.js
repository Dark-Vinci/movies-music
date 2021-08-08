
//  to catch any error that might occur in the 
// try/catch block of any async work in the route handler
module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res);
        } catch (ex) {
            next(ex);
        }
    }
}
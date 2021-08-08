

module.exports = function (app) {
    require('./startup/db')();
    require('./startup/logging')();
    require('./startup/config')();
    require('./startup/routes')(app);
}
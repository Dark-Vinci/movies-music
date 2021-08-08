const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');

const user = require('../router/user');
const admin = require('../router/admin');
const post = require('../router/posts');
const register = require('../router/register');
const login = require('../router/login');
const search = require('../router/search');
const timeline = require('../router/timeline');
const error = require('../middlewares/error');

module.exports = function (app) {
    if (app.get('env') == 'development') {
        app.use(morgan('tiny'));
    }
    
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/user', user);
    app.use('/api/admin', admin);
    app.use('/api/post', post);
    app.use('/api/login', login);
    app.use('/api/search', search);
    app.use('/api/register', register);
    app.use('/api/timeline', timeline);
    
    app.use(error);
}
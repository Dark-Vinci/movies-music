const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');

const user = require('./router/user');
const admin = require('./router/admin');
const post = require('./router/posts');
const register = require('./router/register');
const login = require('./router/login');
const search = require('./router/search');
const timeline = require('./router/timeline');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (app.get('env') == 'development') {
    app.use(morgan('tiny'))
}

app.use('/api/user', user);
app.use('/api/admin', admin);
app.use('/api/post', post);
app.use('/api/login', login);
app.use('/api/search', search);
app.use('/api/register', register);
app.use('/api/timeline', timeline);

app.get('/', (req, res) => {
    res.send('welcome to laughflix ;)')
})

const port = process.env.PORT || 2018;
app.listen(port, () => console.log(`listening on port ${ port }`));
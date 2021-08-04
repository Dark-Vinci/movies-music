const express = require('express');
const helmet = require('helmet');

const user = require('./router/user');
const admin = require('./router/admin');
const post = require('./router/posts');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', user);
app.use('/api/admin', admin);
app.use('/api/post', post);

app.get('/', (req, res) => {
    res.send('welcome to laughflix ;)')
})

const port = process.env.PORT || 2018;
app.listen(port, () => console.log(`listening on port ${ port }`));
const express = require('express');

const router = express.Router();

const { Post } = require('../model/post');

router.post('/', async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length == 0) {
        return res.status(400).json({
            status: 400,
            message: 'no query params'
        });
    } else {
        const toSearch = `.*${ q }.*` ;
        const result = await Post.find()
            .or([
                { title: { $regex: toSearch }},
                { description: { $regex: toSearch }}
            ])
            .sort({ like : -1 });

        if (result.length == 0) {
            return res.status(400).json({
                status: 400,
                message: 'no such post in the db'
            });
        } else {
            res.status(200).json({
                status: 200,
                message: 'success',
                data: result
            });
        }
    }
})

module.exports = router;
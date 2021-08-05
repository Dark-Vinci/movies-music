const express = require('express');

const router = express.Router();

const { Post } = require('../model/post');
const idVerifier = require('../middlewares/idVerifier');

router.post('/', async (req, res) => {
    const post = await Post.aggregate(
        [
            { $match: { isPublished: true }},
            { $sample: { size: 12 }},
            { $project: { createdAt: 0, isPublished: 0 }}
        ]
    );

    if (post.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'we\'re currently working on creating content for you'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: post
        });
    }
});

router.get('/watch/:id', idVerifier, async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, {
        $inc: { watched: 1 }
    }, { new: true })

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: post
        });
    }
});

module.exports = router;
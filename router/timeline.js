const express = require('express');

const router = express.Router();

const { Post } = require('../model/post');
const idVerifier = require('../middlewares/idVerifier');
const wrapper = require('../middlewares/wrapper');

/* 
    FETCHING TIMELINE OF EVERY REQUEST,
    BOTH BY LOGGED IN USER, ADMIN, AND AN UNREGISTERED USER,
    AND ALSO A ROUTE HANDLER FOR WATCHING/LISTENING TO A POST
 */

// route handler for processing the timeline of a request
router.post('/', wrapper ( async (req, res) => {
    // collecting the 12 post that is published 
    const post = await Post.aggregate(
        [
            { $match: { isPublished: true }},
            { $sample: { size: 12 }},
            { $project: { createdAt: 0, isPublished: 0 }},
            { $sort: { createdAt: -1 }}
        ]
    );

    if (post.length == 0) {
        // if the length of the search is zero, a 404 reponse is sent
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
}));

// route handler for watching/listening to a post
router.get('/watch/:id', idVerifier, wrapper ( async (req, res) => {
    const { id } = req.params;
    // getting the post and updating the number of watch
    const post = await Post.findByIdAndUpdate(id, {
        $inc: { watched: 1 }
    }, { new: true });

    if (!post) {
        // post is not available on server
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
}));

module.exports = router;
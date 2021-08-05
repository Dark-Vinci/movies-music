const express = require('express');

const router = express.Router();

const idVerifier = require('../middlewares/idVerifier');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { Post, validate, validatePut } = require('../model/post');
const bodyVerifier = require('../middlewares/bodyVerifier');

const idAuthAdminMiddleware = [ idVerifier, auth, admin ];
const bodyAdminMiddleware = [ bodyVerifier(validate), auth, admin ];
const bodyAdminPutMiddleware = [ bodyVerifier(validatePut), auth, admin ];
const adminMiddleware = [ auth, admin ]

router.get('/get-all', adminMiddleware, async (req, res) => {
    const posts = await Post.find();

    if (post.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'no post yet'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: posts
        });
    }
});

router.get('/all-published', adminMiddleware, async (req, res) => {
    const posts = await Post.find({ isPublished: true });

    if (post.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'no known published post'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: posts
        });
    }
});

router.get('/all-non-published', adminMiddleware, async (req, res) => {
    const posts = await Post.find({ isPublished: false });

    if (post.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'no unpublished post'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: posts
        });
    }
});

router.get('/inspect/:id', idAuthAdminMiddleware , async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

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

router.get('/inspect/like-count', idAuthAdminMiddleware , async (req, res) => {
    const posts = await Post.find({ isPublished: true })
        .select({ likedBy: 1, title: 1 });

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        const toReturn = [];

        posts.forEach(post => {
            const title = post.title;
            const like = post.likedBy.length;

            toReturn.push({ title: like })
        });

        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
});

router.get('/inspect/watch-count', idAuthAdminMiddleware , async (req, res) => {
    const posts = await Post.find({ isPublished: true })
        .select({ watched: 1, title: 1 });

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        const toReturn = [];

        posts.forEach(post => {
            const title = post.title;
            const watch = post.watched;

            toReturn.push({ title: watch })
        });

        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
});

router.put('/like/:id', idVerifier, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.Id;

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        const index = post.likedBy.indexOf(userId);
        if (index >= 0) {
            return res.status(400).json({
                status: 400,
                message: 'you never liked this post before',
            })
        } else {
            post.likedBy.push(userId);
            await post.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `${ post.title } has been liked successfully`
            });
        }
    }
});

router.put('/unlike/:id', idVerifier, async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        const index = post.likedBy.indexOf(userId);

        if (index < 0) {
            return res.status(400).json({
                status: 400,
                message: 'you never liked this post at first'
            });
        } else {
            post.likedBy.splice(index, 1);
            await post.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `${ post.title } has been unliked successfully`
            });
        }
    }
});

router.put('/publish/:id', idAuthAdminMiddleware, async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndUpdate(id, {
        $set: { isPublished: true }
    }, { new: true });

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ post.title } has been successfully published`
        });
    }
});

router.put('/update/:id', bodyAdminPutMiddleware, async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        const { title, description } = req.body;

        post.set({
            title: title || post.title,
            description: description || post.description
        });

        await post.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ post.title } has been successfully updated`
        });
    }
});

router.put('/withdraw-post/:id', idAuthAdminMiddleware, async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndUpdate(id, {
        $set: { isPublished: false }
    }, { new: true });

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ post.title } has been successfully withdrawn`
        });
    }
});

router.post('/create-post', bodyAdminMiddleware, async (req, res) => {
    const { title, description, videoLink, imageLink } = req.body;

    const post = new Post({
        title,
        description,
        videoLink,
        imageLink
    });

    await post.save();

    res.status(201).json({
        status: 201,
        message: 'success',
        data: post
    });
});


router.delete('/remove-post/:id', idAuthAdminMiddleware, async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndRemove(id);

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        res.status(204).json({
            status: 204,
            message: 'success',
            data: post
        });
    }
})

module.exports = router;
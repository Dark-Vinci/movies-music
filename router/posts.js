const express = require('express');

const router = express.Router();

const idVerifier = require('../middlewares/idVerifier');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const { Post, validate, validatePut } = require('../model/post');
const bodyVerifier = require('../middlewares/bodyValidator');
const wrapper = require('../middlewares/wrapper');

// middlewares for route handlers
const idAuthAdminMiddleware = [ idVerifier, auth, admin ];
const bodyAdminMiddleware = [ bodyVerifier(validate), auth, admin ];
const bodyAdminPutMiddleware = [ 
    idVerifier, bodyVerifier(validatePut), 
    auth, admin 
];
const adminMiddleware = [ auth, admin ];

/* 
    ROUTE HANDLERS FOR EVERYTHING RELATED TO POST
 */

// route handler for getting all post in the database
router.get('/get-all', adminMiddleware, wrapper ( async (req, res) => {
    const posts = await Post.find()
        .sort({ createdAt: -1 });

    if (posts.length == 0) {
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
}));

// route handler for getting all published post in the database;
router.get('/all-published', adminMiddleware, wrapper ( async (req, res) => {
    const posts = await Post.find({ isPublished: true });

    if (posts.length == 0) {
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
}));

// ? route handler for getting the list of all non-published posts
router.get('/not-published', adminMiddleware, wrapper ( async (req, res) => {
    const posts = await Post.find({ isPublished: false });

    if (posts.length == 0) {
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
}));

// ? route handler for getting the list of post and its number of watch it has
router.get('/inspect/watch-count', adminMiddleware , wrapper ( async (req, res) => {
    const posts = await Post.find({ isPublished: true })
        .select({ watched: 1, title: 1 });

    const toReturn = [];

    // transform the data gotten from the db to only return title and number of watch
    posts.forEach(post => {
        const watch = post.watched;

        toReturn.push({ [post.title]: watch })
    });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: toReturn
    });
}));

// ? route handler for getting the list of post and its number of like it has
router.get('/inspect/like-count', adminMiddleware , wrapper ( async (req, res) => {
    const posts = await Post.find({ isPublished: true })
        .select({ likedBy: 1, title: 1 });


    const toReturn = [];

    // transform the data gotten from the db to only return title and number of like
    posts.forEach(post => {
        const like = post.likedBy.length;

        toReturn.push({ [post.title]: like })
    });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: toReturn
    });
}));

// ? route handler for inspecting a post by its id only by the admin
router.get('/inspect/:id', idAuthAdminMiddleware , wrapper ( async (req, res) => {
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
}));

// route handler for liking a post, only by the user
router.put('/like/:id', idVerifier, wrapper ( async (req, res) => {
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
        // if the user had already like the post once, a bad request should be returned
        if (index >= 0) {
            return res.status(400).json({
                status: 400,
                message: 'you never liked this post before',
            })
        } else {
            // postId stored in the users document
            post.likedBy.push(userId);
            await post.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `${ post.title } has been liked successfully`
            });
        }
    }
}));

// route handler to unlike a post, only accessible to the users
router.put('/unlike/:id', idVerifier, wrapper ( async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(id);

    //if the post doesnt exist, a 404 response should be sent
    if (!post) { 
        return res.status(404).json({
            status: 404,
            message: 'no post with the supplied id'
        });
    } else {
        const index = post.likedBy.indexOf(userId);

        //if the user hasnt like the post, a bad request response should be returned
        if (index < 0) { 
            return res.status(400).json({
                status: 400,
                message: 'you never liked this post at first'
            });
        } else {
            // the post id gets removed from the users database
            post.likedBy.splice(index, 1);
            await post.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `${ post.title } has been unliked successfully`
            });
        }
    }
}));

// ? tested
// route handler for publishing a post by its id
router.put('/publish/:id', idAuthAdminMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    // update the post from the db
    const post = await Post.findByIdAndUpdate(id, {
        $set: { isPublished: true }
    }, { new: true });

    // if theres no such post with the id, a 404 response would be sent
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
}));

// ? route handler to update the title and the description of a post by the admin
router.put('/update/:id', bodyAdminPutMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) { // if the post doesnt exist in the db, a 404 response should be sent
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        const { title, description } = req.body;

        // the update takes place here
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
}));

// route handler to upblish a post and make it not available to user,
// can only be accessed by the admin
router.put('/withdraw-post/:id', idAuthAdminMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    // the unpublishing happens here
    const post = await Post.findByIdAndUpdate(id, {
        $set: { isPublished: false }
    }, { new: true });

    if (!post) { // if the post is not in the db, 404 response should be sent
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
}));

// ? route handler for creating a post, just by the admin
router.post('/create-post', bodyAdminMiddleware, wrapper ( async (req, res) => {
    const { title, description, videoLink, imageLink } = req.body;

    // initialize the new post
    const post = new Post({
        title,
        description,
        videoLink,
        imageLink
    });

    // save the post
    await post.save();

    res.status(201).json({
        status: 201,
        message: 'success',
        data: post
    });
}));


// ?route handler for deleting a post from the db, only by the admin
router.delete('/remove-post/:id', idAuthAdminMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const post = await Post.findByIdAndRemove(id);

    if (!post) { // if the post is not in the db, a 404 respose should be returned
        return res.status(404).json({
            status: 404,
            message: 'no such post in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ post.title } has been deleted`
        });
    }
}));

module.exports = router;
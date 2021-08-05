const express = require('express');

const router = express.Router();

const { User } = require('../model/user');
const { Post } = require('../model/post');
const idVerifier = require('../middlewares/idVerifier');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const wrapper = require('../middlewares/wrapper');

const idAdminValidator = [ idVerifier, auth, admin ];

router.get('/me', async (req, res) => { 

});

// ! only admin
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
});

// ?? for users
router.put('/remove-from-watch-later/:postId', async (req, res) => {
    const { postId } = req.params;
    const userId  = req.user._id;
    const user = await User.findById(userId);

    const index = user.watchLater.indexOf(postId);

    if (index < 0) {
        return res.status(400).json({
            status: 400,
            message: 'no such post in your document'
        });
    } else {
        user.watchLater.splice(index, 1);
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'the post has been removed from your db'
        });
    }
});

// ?? for users
router.put('/watch-later/:postId', async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({
            status: 404,
            message: 'theres no such post in the db'
        });
    } else {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'user doesnt exist'
            });
        } else {
            const index = user.watchLater.indexOf(postId);
            if (index >= 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'you already have the post in your db'
                });
            } else {
                user.watchLater.push(postId);
                await user.save();
    
                res.status(200).json({
                    status: 200,
                    message: 'success',
                    data: `${ post.title } has been saved to your watch later`
                })
            }
        }
    }
});

// ?? for users
router.get('/my-watch-later', async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .populate({ path: 'watchLater' });

    const toReturn = user.watchLater;

    if (toReturn.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'no have no saved videos'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
});

// !! router for password change

// ! only admin
router.delete('/:id', idAdminValidator, async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id);

    if (!user) {
        return res.status(404).json({
            status: 404,
            message:'user not found in the database'
        });
    } else {
        res.status(204).json({
            status: 204,
            message: 'success',
            data: `${ user.firstName } has been deleted successfully`
        });
    }
});

module.exports = router;
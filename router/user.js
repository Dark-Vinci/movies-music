const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const { User, validatePasswordChange } = require('../model/user');
const { Post } = require('../model/post');
const idVerifier = require('../middlewares/idVerifier');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const wrapper = require('../middlewares/wrapper');
const bodyValidator = require('../middlewares/bodyValidator');

const idAdminValidator = [ idVerifier, auth, admin ];
const adminMiddleware = [ auth, admin ];
const idAuthMiddleware = [ idVerifier, auth ];
const authBodyMiddleware = [ auth, bodyValidator(validatePasswordChange) ];

/* 
    ROUTE HANDLERS FOR HANDLING ALL USER RELATED OPERATIONS
 */

// route handler for getting all the users data, only by the user
router.get('/me', auth, wrapper ( async (req, res) => { 
    const userId = req.user._id;

    // getting the user and populating the liked post,
    // the watched posts, and the watch later 
    const user = await User.findById(userId)
        .select({ password: 0 })
        .populate({
            path: 'likedMovies',
            select: { title: 1, description: 1 }
        })
        .populate({
            path: 'watchedMovies',
            select: { title: 1, description: 1 }
        })
        .populate({
            path: 'watchLater',
            select: { title: 1, description: 1 }
        });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: user
    });
}));

// route handler for getting a users watch later, only by the user
router.get('/watch-later', auth, wrapper ( async (req, res) => {
    const userId = req.user._id;

    // check  for the user and populate the watch later
    const user = await User.findById(userId)
        .populate({ path: 'watchLater' });

    const toReturn = user.watchLater;

    if (toReturn.length == 0) {
        // user has no watch later post in document
        return res.status(404).json({
            status: 404,
            message: 'no saved videos'
        });
    } else { 
        res.status(200).json({
            status: 200,
            message: 'success',
            data: toReturn
        });
    }
}));

// route handler for getting all user only by the admin
router.get('/all-users', adminMiddleware, wrapper ( async (req, res) => {
    const users = await User.find()
        .sort({ createdAt: -1 })
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: users
    });
}));

// route handler for getting a uuser with id and can oly be accessed by admin
router.get('/:id', idAdminValidator, wrapper ( async (req, res) => {
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
}));

// ?? for users
// ? tested
// route handler for removing from a users watch laster, only by the user
router.put('/remove-from-watch-later/:postId', idAuthMiddleware, wrapper ( async (req, res) => {
    const { postId } = req.params;
    const userId  = req.user._id;
    const user = await User.findById(userId);

    const index = user.watchLater.indexOf(postId);
    /*
        if index is less than zero, the post was never added into the users
        document, so the operation should be terminated, else the operation
        should proceed
     */

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
}));

// ?? for users
// ?tested
// route for adding to a user's array of watch later, just by the user
router.put('/watch-later/:postId', idAuthMiddleware, wrapper ( async (req, res) => {
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
        const index = user.watchLater.indexOf(postId); 

        /* 
            if the index is greater than zero, then the postid exist in the 
            in the users list of watch later and a 404 response can be returned
            if not, the operation should continue
        */
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
            });
        }
    }
}));

// routes for changing the password of a user by only by the user
router.put('/change-password', authBodyMiddleware, wrapper ( async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // compare the user password and the password passed
    const user = await User.findById(userId);
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        // rehash the password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        user.password = hashed;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is ${ newPassword }`
        });
    }
}));

// route for deleting a user, and it can only be accessed by admin
router.delete('/:id', idAdminValidator, wrapper ( async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id);

    if (!user) {
        return res.status(404).json({
            status: 404,
            message:'user not found in the database'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ user.firstName } has been deleted successfully`
        });
    }
}));

module.exports = router;
const express = require('express');

const router = express.Router();

const { Post } = require('../model/post');
const wrapper = require('../middlewares/wrapper');

/* 
    MAKING SEARCH IN THE DATABASE BY ANYONE,
    INCLUDING THE LOGGEDIN USER, ADMIN AND ANYONE
 */

 // route handler for searching the db
router.post('/', wrapper ( async (req, res) => {
    // get the search parameter as a query param
    const { q } = req.query;

    if (!q || q.trim().length == 0) {
        //invalid search params
        return res.status(400).json({
            status: 400,
            message: 'no query params'
        });
    } else {
        const toSearch = `.*${ q }.*` ;
        // search the db using regex and soring in descending number of watch

        const result = await Post.find()
            .or([
                { title: { $regex: toSearch }},
                { description: { $regex: toSearch }}
            ])
            .sort({ watched : -1 });

        if (result.length == 0) {
            // for no matching result
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
}));

module.exports = router;
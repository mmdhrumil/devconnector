const express = require('express');
const router = express.Router();
const config = require('config');
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Post'); 
const Post = require('../../models/Post');


// @route POST api/posts
// @description Create a post
// @access Private

router.post('/', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty(),
    ]
],
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try{
        const user = await User.findById(req.user.id);
        
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);

    }catch(err){
        console.log(err.message);
        return res.status(500).send("Server Error");
    }
});



// @route GET api/posts
// @description Get all posts
// @access Private

router.get('/', auth, async (req, res) => {
    try{
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    }catch(err){
        console.log(err.message);
        res.status(500).send("Server error");
    }
});



// @route GET api/posts/:id
// @description Get a post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({msg: "Post not found for the ID."});
        }

        res.json(post);


    }catch(err){
        console.log(err.message);

        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post not found for the ID."});
        }

        res.status(500).send("Server error");
    }
});



// @route DELETE api/posts/:id
// @description Delete a posts
// @access Private

router.delete('/:id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg: "Post not found for the ID."});
        }
        // Check if the user is authorized to delete
        
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: "User not authorized"});
        }

        else{
            await post.remove();
        }

        res.json({msg: "Post successfully removed"});

    }catch(err){
        console.log(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post not found for the ID."});
        }
        res.status(500).send("Server error");
    }
});



// @route PUT api/posts/like/:id
// @description Like a post
// @access Private

router.put('/like/:id', auth,
async (req, res) => {
    try{

        const post = await Post.findById(req.params.id);

        // Check if user already liked the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg: "Post already liked"});
        }

        post.likes.unshift({ user: req.user.id});

        await post.save();
        return res.json(post.likes);

    }
    catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
});



// @route PUT api/posts/unlike/:id
// @description Unlike a post
// @access Private

router.put('/unlike/:id', auth,
async (req, res) => {
    try{

        const post = await Post.findById(req.params.id);

        // Check if user already liked the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg: "Post not already liked"});
        }

        // Get remove index 
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);

        await post.save();
        return res.json(post.likes);

    }
    catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


// @route POST api/posts/comment/:id
// @description Comment on a post
// @access Private

router.post('/comment/:id', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty(),
    ]
],
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try{
        const user = await (await User.findById(req.user.id)).isSelected('-password');
        const post = await Post.findById(req.params.id);


        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment);

        await post.save();
        res.json(post.comments);

    }catch(err){
        console.log(err.message);
        return res.status(500).send("Server Error");
    }
});



// @route DELETE api/posts/comment/:id/:comment_id
// @description Delete a comment on a post
// @access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        // Pull out the comment to be deleted
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // Make sure comment exists
        if(!comment){
            return res.status(404).json({msg: "Comment not found for the ID."});
        }
        
        // Check if the user is authorized to delete
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg: "User not authorized to delete the comment"});
        }
        else{
            // Get remove index 
            const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
            post.comments.splice(removeIndex, 1);

            await post.save();
            return res.json(post.comments);
        }

    }catch(err){
        console.log(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg: "Post not found for the ID."});
        }
        res.status(500).send("Server error");
    }
});

module.exports = router;
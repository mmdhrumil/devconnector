const express = require('express');
const router = express.Router();

// @route GET api/posts
// @description Test route for adding users
// @access Public

router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;
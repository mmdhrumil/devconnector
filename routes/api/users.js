const express = require('express');
const router = express.Router();

// @route GET api/users
// @description Test route for adding users
// @access Public

router.get('/', (req, res) => res.send('User route'));

module.exports = router;
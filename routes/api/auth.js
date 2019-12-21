const express = require('express');
const router = express.Router();

// @route GET api/auth
// @description Test route for adding users
// @access Public

router.get('/', (req, res) => res.send('Authentication route'));

module.exports = router;
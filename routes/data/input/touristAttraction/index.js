const express = require('express');
const router = express.Router();

const categoryRouter = require('./category');

router.use('/category', categoryRouter);

module.exports = router;
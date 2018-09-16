const express = require('express');
const router = express.Router();

const inputDirectoryRouter = require('./input/index');
const outputDirectoryRouter = require('./output/index');

router.use('/input', inputDirectoryRouter);
router.use('/output', outputDirectoryRouter);


module.exports = router;
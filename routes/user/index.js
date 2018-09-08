const express = require('express');
const router = express.Router();

const signInRouter = require('./signIn');
const signUpRouter = require('./signUp');

const profileDirectoryRouter = require('./update/index');

router.use('/sign-in', signInRouter);
router.use('/sign-up', signUpRouter);

router.use('/update', profileDirectoryRouter);

module.exports = router;
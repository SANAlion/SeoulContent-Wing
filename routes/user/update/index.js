const express = require('express');
const router = express.Router();

const nickNameRouter = require('./nickName');
const passwordRouter = require('./password');

router.use('/nick-name', nickNameRouter);
router.use('/password', passwordRouter);

module.exports = router;
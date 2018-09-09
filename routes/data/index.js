const express = require('express');
const router = express.Router();

const electricWheelChairRouter = require('./electricWheelChair');

router.use('/electric-wheel-chair', electricWheelChairRouter);

module.exports = router;
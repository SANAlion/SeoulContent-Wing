const express = require('express');
const router = express.Router();

const electricWheelChairRouter = require('./electricWheelChair');

router.use('/electric-wheelchair', electricWheelChairRouter);

module.exports = router;
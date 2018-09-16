const express = require('express');
const router = express.Router();

const electricWheelChairRouter = require('./electricWheelChair');
const touristAttractionDirectoryRouter = require('./touristAttraction/index');

router.use('/electricWheelChair', electricWheelChairRouter);
router.use('/tourist-attraction', touristAttractionDirectoryRouter);

module.exports = router;
const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../../../privateModules/amazonWebService/rds');
const parsing = require('../../../../privateModules/parsing');

router.get('/:pageCount', (req, res) => {
	let pageCount = req.params.pageCount;
	let category = req.query.category;
	let touristAttractionCategoryTaskArray = [
		(callback) => {
			parsing.touristAttraction(category, pageCount, (error, result) => {
				if(error) {
					callback('Parsing error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Parsing error : ' + error
					});
				} else {
					callback(null, result);
				}
			});
		},
		(parsing1, callback) => {
			console.log(parsing1);
		}
	];

	

	async.waterfall(touristAttractionCategoryTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
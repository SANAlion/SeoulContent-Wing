const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../../privateModules/amazonWebService/rds');

router.get('/', (req, res) => {
	let outputElectricWheelChairTaskArray = [
		(callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail : ' + error
					});
				} else {
					callback(null, result);
				}
			});
		},
		(connection, callback) => {
			let selectElectricWheelChair = 'select * from WheelchairLocation';

			connection.query(selectElectricWheelChair, (error, result) => {
				connection.release();

				if(error) {
					callback('Select electric-wheelchair query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Select electric-wheelchair query error : ' + error
					});
				} else {
					callback(null, 'Output electric-wheelchair success');

					res.status(200).send({
						stat : 'Success',
						msg : 'Ouput electric-wheelchair success',
						data : result
					});
				}
			});
		}
	];

	async.waterfall(outputElectricWheelChairTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
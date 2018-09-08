const express = require('express');
const router = express.Router();
const async = require('async');
const moment = require('moment-timezone');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/', (req, res) => {
	// req.headers.token;
	// req.body.title;
	// req.body.content;

	let createBoardTaskArray = [
		(callback) => {
			jsonWebToken.checkToken(req.headers.token, (error, result) => {
				if(error) {
					callback('JsonWebToken check fail : ' + error);

					res.status(403).send({
						stat : 'Fail',
						msg : 'JsonWebToken check fail : ' + error
					});
				} else {
					callback(null, result.userSeq);
				}
			});
		},
		(userSeq, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail : ' + error
					});
				} else {
					callback(null, userSeq, result);
				}
			});
		},
		(userSeq, connection, callback) => {
			let insertBoardQuery = 'insert into Board values (?, ?, ?, ?, ?, ?)';
			moment.tz.setDefault('Asia/Seoul');
			let now = moment().format('YYYY-MM-DD HH:mm:ss');
			
			connection.query(insertBoardQuery, [null, req.body.title, req.body.content, 0, userSeq, now], (error, result) => {
				connection.release();

				if(error) {
					callback('Insert board query error : ' + error);
				} else {
					callback(null, 'Create board task success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Create board task success'
					});
				}
			});
		}
	];

	async.waterfall(createBoardTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
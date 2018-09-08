const express = require('express');
const router = express.Router();
const async = require('async');
const moment = require('moment-timezone');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/:boardSeq', (req, res) => {
	let createCommentTaskArray = [
		(callback) => {
			jsonWebToken.checkToken(req.headers.token, (error, result) => {
				if(error) {
					callback('JWT check fail : ' + error);

					res.status(403).send({
						stat : 'Fail',
						msg : 'JWT check fail : ' + error
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
					callback(null, result, userSeq)
				}
			});
		},
		(connection, userSeq, callback) => {
			let insertCommentQuery = 'insert into Comment values (?, ?, ?, ?, ?)';
			moment.tz.setDefault('Asia/Seoul');
			let now = moment().format('YYYY-MM-DD HH:mm:ss');

			connection.query(insertCommentQuery, [null, req.body.content, now, userSeq, parseInt(req.params.boardSeq)], (error) => {
				connection.release();

				if(error) {
					callback('Insert comment query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Insert comment query error : ' + error
					});
				} else {
					callback(null, 'Create comment success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Create comment success'
					});
				}
			});
		}
	];

	async.waterfall(createCommentTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
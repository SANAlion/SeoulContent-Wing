const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/:boardSeq', (req, res) => {
	// req.headers.token;
	// req.params.boardSeq;
	// req.body.title;
	// req.body.content;
	let updateBoardTaskArray = [
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
					callback(null, userSeq, result);
				}
			});
		},
		(userSeq, connection, callback) => {
			let updateBoardQuery = 'update Board set title = if(userSeq = ?, ?, title), content = if(userSeq = ?, ?, content) where seq = ?';

			connection.query(updateBoardQuery, [parseInt(userSeq), req.body.title, parseInt(userSeq), req.body.content, parseInt(req.params.boardSeq)], (error, result) => {
				connection.release();

				if(error) {
					callback('Update board query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update board query error : ' + error
					});
				} else if(result.changedRows === 0) {
					callback('Update board fail : not verified user or board');

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update board fail : not verified user or board'
					});
				} else {
					callback(null, 'Update board success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Update board success'
					});
				}
			});
		}
	];

	async.waterfall(updateBoardTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
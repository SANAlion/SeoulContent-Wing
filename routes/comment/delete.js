const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/:commentSeq', (req, res) => {
	// req.headrs.token;
	// req.params.commentSeq;
	let deleteCommentTaskArray = [
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
			let deleteCommentQuery = 'delete from Comment where (userSeq = ? and seq = ?)';

			connection.query(deleteCommentQuery, [userSeq, parseInt(req.params.commentSeq)], (error) => {
				connection.release();

				if(error) {
					callback('Delete comment query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Delete comment query : ' + error
					});
				} else {
					callback(null, 'Delete comment success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Delete comment success'
					});
				}
			});
		}
	];

	async.waterfall(deleteCommentTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
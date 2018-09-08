const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/:commentSeq', (req, res) => {
	// req.headers.token;
	// req.params.commentSeq;
	let updateCommentTaskArray = [
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
			let updateCommentQuery = 'update Comment set content = if (userSeq = ?, ?, content) where seq = ?';

			connection.query(updateCommentQuery, [userSeq, req.body.content, parseInt(req.params.commentSeq)], (error, result) => {
				connection.release();

				if(error) {
					callback('Update comment query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update comment query error : ' + error
					});
				} else if(result.changedRows === 0) {
					callback(null, 'Update comment fail : not verified');

					res.status(403).send({
						stat : 'Fail',
						msg : 'Update comment fail : not verified'
					});
				} else {
					callback(null, 'Update comment success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Update comment success'
					});
				}
			});
		}
	];

	async.waterfall(updateCommentTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
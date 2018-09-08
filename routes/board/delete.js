const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/:boardSeq', (req, res) => {
	// req.headers.token;
	// req.params.boardSeq;
	let deleteBoardTaskArray = [
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
			let deleteBoardQuery = 'delete from Board where seq = ? and userSeq = ?';
			//'delete Board, Comment, LikeTable from Board inner join Comment inner join LikeTable where Board.seq = Comment.boardSeq and Comment.boardSeq = LikeTable.boardSeq and Board.seq = ? and Board.userSeq = ?'

			connection.query(deleteBoardQuery, [parseInt(req.params.boardSeq), userSeq], (error, result) => {
				if(error) {
					callback('Delete board query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Delete board query error : ' + error
					});
				} else {
					callback(null, 'Delete board success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Delete board success'
					});
				}
			});
		}
	];

	async.waterfall(deleteBoardTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.get('/:boardSeq', (req, res) => {
	let readBoardTaskArray = [
		(callback) => {
			jsonWebToken.checkToken(req.headers.token, (error, result) => {
				if(error) {
					callback('JWT check error : ' + error);

					res.status(403).send({
						stat : 'Fail',
						msg : 'JWT check fail : ' + error
					});
				} else callback(null, result.userSeq);
			});
		},
		(userSeq, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail'
					});
				} else callback(null, userSeq, result);
			});
		},
		(userSeq, connection, callback) => {
			let selectBoardQuery = 'select User.nickName, Board.seq, Board.title, Board.content, Board.likeCount, Board.date from User join Board on User.seq = Board.userSeq where Board.seq = ?';

			connection.query(selectBoardQuery, [parseInt(req.params.boardSeq)], (error, result) => {
				if(error) {
					connection.release();
					callback('Select board query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Select board query error : ' + error
					});
				} else callback(null, userSeq, connection, result[0]);
			});
		},
		(userSeq, connection, boardData, callback) => {
			let selectLikeQuery = 'select seq from LikeTable where userSeq = ? and boardSeq = ?';

			connection.query(selectLikeQuery, [userSeq, parseInt(req.params.boardSeq)], (error, result) => {
				connection.release();

				if(error) {
					callback('Select like query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Select like query error : ' + error
					});
				} else if(result[0] === undefined) {
					boardData.likeStatus = 0;

					callback(null, 'Read board success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Read board success',
						data : boardData
					});
				} else {
					boardData.likeStatus = 1;

					callback(null, 'Read board success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Read board success',
						data : boardData
					});
				}
			});
		}
	];

	async.waterfall(readBoardTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
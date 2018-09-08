const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');

router.get('/:boardSeq', (req, res) => {
	let readBoardTaskArray = [
		(callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail'
					});
				} else callback(null, result);
			});
		},
		(connection, callback) => {
			let selectBoardQuery = 'select User.nickName, Board.seq, Board.title, Board.content, Board.likeCount, Board.date from User join Board on User.seq = Board.userSeq where Board.seq = ?';

			connection.query(selectBoardQuery, req.params.boardSeq, (error, result) => {
				connection.release();

				if(error) {
					callback('Select board query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Select board query error : ' + error
					});
				} else {
					callback(null, 'Select board query success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Read board with seq success',
						data : result[0]
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
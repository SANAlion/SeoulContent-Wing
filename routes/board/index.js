const express = require('express');
const router = express.Router();
const async = require('async');

const createRouter = require('./create');
const readRouter = require('./read');
const updateRouter = require('./update');
const deleteRouter = require('./delete');

router.use('/create', createRouter);
router.use('/read', readRouter);
router.use('/update', updateRouter);
router.use('/delete', deleteRouter);

const rds = require('../../privateModules/amazonWebService/rds');

router.get('/', (req, res) => {
	// req.query.startIndex;
	// req.query.count
	let selectBoardTaskArray = [
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
			let selectBoardQuery = 'select User.nickName, Board.seq, Board.title, Board.likeCount, Board.date from User join Board on User.seq = Board.userSeq order by Board.date desc limit ?, ?';
			let startIndex = parseInt(req.query.startIndex);
			let count = parseInt(req.query.count);
			
			connection.query(selectBoardQuery, [startIndex, count], (error, result) => {
				connection.release();

				if(error) {
					callback('Select board query error : ' + error);
				} else {
					callback(null, 'Read board success');

					res.status(200).send({
						stat : 'Success',
						msg : 'Read board success',
						data : result
					});
				}
			});
		}
	];

	async.waterfall(selectBoardTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		console.log('Async success : ' + result);
	});
});

module.exports = router;
const express = require('express');
const router = express.Router();
const async = require('async');

const createRouter = require('./create');
const updateRouter = require('./update');
const deleteRouter = require('./delete');

router.use('/create', createRouter);
router.use('/update', updateRouter);
router.use('/delete', deleteRouter);

const rds = require('../../privateModules/amazonWebService/rds');

router.get('/:boardSeq', (req, res) => {
	// req.query.startIndex;
	// req.query.count
	let readCommentTaskArray = [
		(callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail : ' + error
					});
				} else callback(null, result);
			});
		},
		(connection, callback) => {
			let selectCommentQuery = 'select Comment.seq, Comment.content, Comment.date, User.nickName from Comment join User on User.seq = Comment.userSeq where boardSeq = ? order by Comment.seq desc limit ?, ? ';

			connection.query(selectCommentQuery, [parseInt(req.params.boardSeq), parseInt(req.query.startIndex), parseInt(req.query.count)], (error, result) => {
				connection.release();

				if(error) {
					callback('Select comment query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Select comment query error : ' + error
					});
				} else if(result[0] === undefined) {
					callback(null, 'Read comment success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Read comment success(but no data)'
					});
				} else {
					callback(null, 'Read comment success');

					res.status(200).send({
						stat : 'Success',
						msg : 'Read comment success',
						data : result
					});
				}
			});
		}
	];

	async.waterfall(readCommentTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
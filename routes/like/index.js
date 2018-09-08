const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/', (req, res) => {
	let boardSeq = parseInt(req.body.boardSeq);
	// req.headers.token;

	let likeTaskArray = [
		(callback) => {
			jsonWebToken.checkToken(req.headers.token, (error, result) => {
				if(error) {
					callback('JsonWebToken error : ' + error);

					res.status(403).send({
						stat : 'Fail',
						msg : 'JsonWebToken error : ' + error
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
			let likeCheckQuery = 'select seq from LikeTable where (userSeq = ? and boardSeq = ?)';
			
			connection.query(likeCheckQuery, [userSeq, boardSeq], (error, result) => {
				if(error) {
					connection.release();

					callback('Like check query error : ' + error);
				} else if(result[0] !== undefined) {
					callback(null, userSeq, connection, 1);
				} else {
					callback(null, userSeq, connection, 0);
				}
			});
		},
		(userSeq, connection, likeCheck, callback) => {
			if(likeCheck === 0) {
				let insertLikeQuery = 'insert into LikeTable values (?, ?, ?)';

				connection.query(insertLikeQuery, [null, userSeq, boardSeq], (error) => {
					if(error) {
						connection.release();

						callback('Insert like query error : ' + error);
					} else {
						callback(null, userSeq, connection, likeCheck);
					}
				});
			} else {
				let deleteLikeQuery = 'delete from LikeTable where (userSeq = ? and boardSeq = ?)';

				connection.query(deleteLikeQuery, [userSeq, boardSeq], (error) => {
					if(error) {
						connection.release();

						callback('Delete like query error : ' + error);
					} else {
						callback(null, userSeq, connection, likeCheck);
					}
				});
			}
		},
		(userSeq, connection, likeCheck, callback) => {
			if(likeCheck === 0) {
				let updateBoardLikeQuery = 'update Board set likeCount = likeCount + 1 where seq = ?';

				connection.query(updateBoardLikeQuery, boardSeq, (error, result) => {
					connection.release();

					if(error) {
						callback('Update board like query error : ' + error);
					} else {
						callback(null, 'Update like success');

						res.status(201).send({
							stat : 'Success',
							msg : 'Update like success'
						});						
					}
				});
			} else {
				let updateBoardLikeQuery = 'update Board set likeCount = likeCount - 1 where seq = ?';

				connection.query(updateBoardLikeQuery, boardSeq, (error, result) => {
					connection.release();

					if(error) {
						callback('Update board like query error : ' + error);
					} else {
						callback(null, 'Update like success');

						res.status(201).send({
							stat : 'Success',
							msg : 'Update like success'
						});						
					}
				});
			}
		}
	];

	async.waterfall(likeTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	})
});

module.exports = router;
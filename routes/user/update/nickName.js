const express = require('express');
const router = express.Router();
const async = require('async');

const rds = require('../../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../../privateModules/jsonWebToken');

router.post('/', (req, res) => {
	let updateNickNameTaskArray = [
		(callback) => {
			jsonWebToken.checkToken(req.headers.token, (error, result) => {
				if(error) {
					callback('JWT check fail : ' + error);

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
				} else {
					callback(null, userSeq, result);
				}
			});
		},
		(userSeq, connection, callback) => {
			let updateNickNameQuery = 'update User set nickName = ? where seq = ?';

			connection.query(updateNickNameQuery, [req.body.nickName, userSeq], (error, result) => {
				connection.release();

				if(error) {
					callback('Update nickname fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update nickname fail : is duplicated' 
					});
				}
				else if(result.changedRows === 0) {
					callback('Update nickname fail : same with your past nickname');

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update nickname fail : same with your past nickname'
					});
				} else {
					callback(null, 'Update nickname success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Update nickname success'
					});
				}
			});
		}
	];

	async.waterfall(updateNickNameTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});


module.exports = router;
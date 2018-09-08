const express = require('express');
const router = express.Router();
const async = require('async');
const crypto = require('crypto');

const rds = require('../../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../../privateModules/jsonWebToken');

router.post('/', (req, res) => {
	let updatePasswordTaskArray = [
		(callback) => {
			if((req.headers.token === '' || req.headers.token === null || req.headers.token === undefined) || (req.body.currentPassword === '' || req.body.currentPassword === null || req.body.currentPassword === undefined) || (req.body.newPassword === '' || req.body.newPassword === null || req.body.newPassword === undefined)) {
				callback('Validity check ....... fail');

				res.status(403).send({
					stat : 'Fail',
					msg : 'Validity check fail'
				});
			} else {
				callback(null, 'Validity check success');
			}
		},
		(validity, callback) => {
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
			let getCurrentPasswordQuery = 'select salt, password from User where seq = ?';

			connection.query(getCurrentPasswordQuery, userSeq, (error, result) => {
				if(error) {
					callback('Query error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Query error'
					});
				} else {
					callback(null, userSeq, connection, result[0].salt, result[0].password);
				}
			});
		},
		(userSeq, connection, salt, password, callback) => {
			crypto.pbkdf2(req.body.currentPassword, salt, 100000, 64, 'SHA512', (error, result) => {
				if(error) callback('Hashing fail : ' + error);
				else if(result.toString('base64') !== password) {
					callback('Update password fail : not equal with current password');

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update password fail : not equal with current password'
					});
				} else {
					callback(null, userSeq, connection, salt);
				}
			});
		},
		(userSeq, connection, salt, callback) => {
			crypto.pbkdf2(req.body.newPassword, salt, 100000, 64, 'SHA512', (error, result) => {
				if(error) callback('Hashing fail : ' + error);
				else callback(null, userSeq, connection, result.toString('base64'));
			});
		},
		(userSeq, connection, hashedNewPassword, callback) => {
			let updateNewPasswordQuery = 'update User set password = ? where seq = ?';

			connection.query(updateNewPasswordQuery, [hashedNewPassword, userSeq], (error, result) => {
				connection.release();

				if(error) {
					callback('Update password fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Update password fail : ' + error
					});
				} else {
					callback(null, 'Update password success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Update password success'
					});
				}
			});
		}
	];

	async.waterfall(updatePasswordTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
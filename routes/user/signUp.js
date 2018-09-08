const express = require('express');
const router = express.Router();
const async = require('async');
const crypto = require('crypto');

const rds = require('../../privateModules/amazonWebService/rds');

router.post('/', (req, res) => {
	let signUpTaskArray = [
		(callback) => {
			if((req.body.id !== '' && req.body.id !== undefined && req.body.id !== null) && (req.body.nickName !== '' && req.body.nickName !== undefined && req.body.nickName !== null) && (req.body.password !== '' && req.body.password !== undefined && req.body.password !== null) && (req.body.password === req.body.passwordCheck)) {
				callback(null, 'validity check ... ok');
			} else {
				callback('validity check ... fail');

				res.status(403).send({
					stat : 'Fail',
					msg : 'Validity check fail'
				});
			}
		},
		(validity, callback) => {
			crypto.randomBytes(32, (error, result) => {
				if(error) callback('Salting fail : ' + error);
				else callback(null, result.toString('base64'));
			});
		},
		(salt, callback) => {
			crypto.pbkdf2(req.body.password, salt, 100000, 64, 'SHA512', (error, result) => {
				if(error) callback('Hashing fail : ' + error);
				else callback(null, result.toString('base64'), salt);
			});
		},
		(hashedPassword, salt, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail'
					});
				} else callback(null, hashedPassword, salt, result);
			});
		},
		(hashedPassword, salt, connection, callback) => {
			let checkNickNameQuery = 'select * from User where (id = ? or nickName = ?)';

			connection.query(checkNickNameQuery, [req.body.id ,req.body.nickName], (error, result) => {
				if(error) {
					connection.release();
					callback('Query fail : ' + error);
				} else if(result[0] !== undefined) {
					console.log(result);

					connection.release();

					if(result[0].id === req.body.id) {
						callback('Sign-up fail : duplicated id');

						res.status(500).send({
							stat : 'Fail',
							msg : 'Sign-up fail : duplicated id'
						});
					} else if(result[0].nickName === req.body.nickName) {
						callback('Sign-up fail : duplicated nickName');

						res.status(500).send({
							stat : 'Fail',
							msg : 'Sign-up fail : duplicated nickName'
						});
					}
				} else {
					callback(null, hashedPassword, salt, connection);
				}
			});
		},
		(hashedPassword, salt, connection, callback) => {
			let signUpQuery = 'insert into User values (?, ?, ?, ?, ?, ?)';

			connection.query(signUpQuery, [null, req.body.id, req.body.nickName, hashedPassword, salt, req.body.authentication], (error) => {
				connection.release();

				if(error) callback('Query fail : ' + error);
				else {
					callback(null, 'All task success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Sign-up success'
					});
				}
			});
		}
	];

	async.waterfall(signUpTaskArray, (error, result) => {
		if(error) console.log('Async task fail : ' + error);
		else console.log(result);
	});
});

module.exports = router;
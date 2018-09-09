const express = require('express');
const router = express.Router();
const async = require('async');
const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');

const rds = require('../../privateModules/amazonWebService/rds');
const jsonWebToken = require('../../privateModules/jsonWebToken');

router.post('/', (req, res) => {
	let signInTaskArray = [
		(callback) => {
			if(req.headers.token !== undefined) {
				jsonWebToken.checkToken(req.headers.token, (error, result) => {
					if(error) {
						callback(null, 'Next task');
					} else {
						callback('Not error, token sign-in');

						res.status(201).send({
							stat : 'Success',
							msg : 'Not error, token sign-in'
						});
					}
				});
			} else {
				callback(null, 'Next task');
			}
		},
		(tokenAccess, callback) => {
			if((req.body.id !== '' && req.body.id !== undefined && req.body.id !== null) && (req.body.password !== '' && req.body.password !== undefined && req.body.password !== null)) callback(null, 'validity check success');
			else {
				callback('Sign-in fail : not enough input');

				res.status(403).send({
					stat : 'Fail',
					msg : 'not enough input'
				});
			}
		},
		(validity, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) callback('RDS connection fail : ' + error);
				else callback(null, result);
			});
		},
		(connection, callback) => {
			let signInQuery = 'select * from User where id = ?';

			connection.query(signInQuery, req.body.id, (error, userData) => {
				connection.release();

				if(error) callback('Query fail : ' + error);
				else if(userData[0] === undefined) {
					callback('Sign-in fail : no user');

					res.status(500).send({
						stat : 'Fail',
						msg : 'no user'
					});
				} else {
					callback(null, userData[0]);
				}
			});
		},
		(userData, callback) => {
			crypto.pbkdf2(req.body.password, userData.salt, 100000, 64, 'SHA512', (error, result) => {
				if(error) callback('Hashing fail : ' + error);
				else if(result.toString('base64') === userData.password) callback(null, userData);
				else {
					callback('Sign-in fail : no user');

					res.status(500).send({
						stat : 'Fail',
						msg : 'no user'
					});
				}
			});
		},
		(userData, callback) => {
			jsonWebToken.createToken(userData.seq, (error, result) => {
				if(error) {
					callback('JWT create fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'JWT create fail : ' + error
					});
				} else {
					callback(null, 'All task success');

					res.status(201).send({
						stat : 'Success',
						msg : 'Sign-in success',
						data : result
					});
				}
			});
		}
	];

	async.waterfall(signInTaskArray, (error, result) => {
		if(error) console.log('async task fail : ' + error);
		else console.log(result);
	});
});

module.exports = router;
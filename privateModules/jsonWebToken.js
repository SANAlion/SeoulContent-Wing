const jsonwebtoken = require('jsonwebtoken');
const jsonWebTokenSet = require('../config/jsonWebTokenSet.json');

module.exports.createToken = function(userSeq, callbackFunction) {
	let payload = {
		userSeq : userSeq
	};

	let option = {
		algorithm : 'HS512',
		expiresIn : 3600 * 24 * 3600
	};

	jsonwebtoken.sign(payload, jsonWebTokenSet.secret, option, (error, token) => {
		if(error) {
			console.log('Create jsonWebToken fail : ' + error);

			callbackFunction(error, null);
		} else {
			console.log('Create jsonWebToken success');

			callbackFunction(null, token);
		}
	});
};

module.exports.checkToken = function(jsonWebToken, callbackFunction) {
	jsonwebtoken.verify(jsonWebToken, jsonWebTokenSet.secret, (error, result) => {
		if(error) {
			console.log(error);

			if(error.message === 'jwt expired') {
				console.log('Check jsonWebToken fail : ' + error.message);

				callbackFunction(error.message, null);
			} else if(error.message === 'invalid token') {
				console.log('Check jsonWebToken fail : ' + error.message);

				callbackFunction(error.message, null);
			} else {
				console.log('Check jsonWebToken fail : unexpected error');

				callbackFunction('Unexpected error', null);
			}
		} else {
			callbackFunction(null, result);
		}
	});
};
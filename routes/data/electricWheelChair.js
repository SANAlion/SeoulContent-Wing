const express = require('express');
const router = express.Router();
const async = require('async');
const request = require('request');

const rds = require('../../privateModules/amazonWebService/rds');

router.get('/', (req, res) => {
	let electricWheelChairDataTaskArray = [
		(callback) => {
			request('http://openapi.seoul.go.kr:8088/4c7459747368616e3435794c53544c/json/MgisRapidCharge/1/208', (error, response, body) => {
				if(error) {
					callback('Request error : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'Request error : ' + error
					});
				} else {
					callback(null, response, body);
				}
			});
		},
		(response, body, callback) => {
			rds.createConnect.getConnection((error, result) => {
				if(error) {
					callback('RDS connect fail : ' + error);

					res.status(500).send({
						stat : 'Fail',
						msg : 'RDS connect fail : ' + error
					});
				} else {
					callback(null, response, body, result);
				}
			});
		},
		(response, body, connection, callback) => {
			let jsonArrayData = JSON.parse(body).MgisRapidCharge.row;
			let insertWheelChairDataQuery = 'insert into WheelchairLocation values (?, ?, ?, ?, ?, ?, ?)';

			for(let i = 0; i < jsonArrayData.length; i++) {
	  		connection.query(insertWheelChairDataQuery, [null, jsonArrayData[i]["COT_ADDR_FULL_OLD"], jsonArrayData[i]["COT_CONTS_NAME"], jsonArrayData[i]["COT_VALUE_01"] + '/' + jsonArrayData[i]["COT_VALUE_02"] + '/' + jsonArrayData[i]["COT_VALUE_03"] + '/' + jsonArrayData[i]["COT_VALUE_04"], jsonArrayData[i]["COT_COORD_Y"], jsonArrayData[i]["COT_COORD_X"], jsonArrayData[i]["COT_TEL_NO"]], (queryError, queryResult) => {
	  			if(queryError) {
	  				callback('Insert wheelchair data query error : ' + error);

	  				res.status(500).send({
	  					stat : 'Fail',
	  					msg : 'Insert wheelchair data query error : ' + error
	  				});
	  			} else {
	  				if(i === jsonArrayData.length - 1) {
		  				res.status(200).send({
		  					stat : 'Success',
		  					msg : 'Insert wheelchair data success'
		  				});
		  			}
	  			}
	  		});
	  	}
		}
	];

	async.waterfall(electricWheelChairDataTaskArray, (error, result) => {
		if(error) console.log('Async fail : ' + error);
		else console.log('Async success : ' + result);
	});
});

module.exports = router;
const mysql = require('mysql');
const rdsSetting = require('../../config/amazonWebService/rdsSet.json');

module.exports.createConnect = mysql.createPool(rdsSetting);
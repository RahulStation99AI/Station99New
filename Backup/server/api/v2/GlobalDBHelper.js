
var mysql = require('mysql');
const fs = require('fs');
var dbConfig=require('../../dbconfig');
class GlobalDBHelper {
	constructor(dbName) {
		this.dbName = dbName;
	}

	getConnection(dbName) {
		console.log("in getConnection :" + dbName);

		var onestation = mysql.createConnection({
			host: dbConfig.hostname,
            user: dbConfig.username,
        	password: dbConfig.password,
			database: dbName,
			port: 3306
		});
		onestation.connect();
		return onestation;
	}
}

module.exports = { GlobalDBHelper }
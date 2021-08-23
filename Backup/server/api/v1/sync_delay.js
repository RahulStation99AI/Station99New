var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* GET delay for web application. */
router.post('/', function (req, res, next) {
	var dbName = "station99";
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(`SELECT stationid,delay,delay_value from radio_station where stationid='` + req.headers.radio_station_id + `'`, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				//console.log(results);
				res.send(JSON.stringify({ "status": 200, "error": null, "response": results, "success": true }));
				//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}


});

module.exports = router;

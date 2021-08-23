var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
    var selectDataQuery = `CALL get_home_add_banner( "` + reqAirdate + `" , "` + reqAirtime + `" )`;
	var dbName = "station99";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var resData = results[0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": resData, "success": true }));
					//If there is no error, all is good and response is 200OK.
					onestation.end();
				}

			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}

});
module.exports = router;

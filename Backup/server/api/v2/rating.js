var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var ratingEvent = 21;
	var ratingQuery = "INSERT INTO rating (user_id,device_id,rating,r_datetime) VALUES ?";
	var ratingValue = [[req.body.user_id, req.body.device_id, req.body.rating, req.body.timestamp]];
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(ratingQuery, [ratingValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
				onestation.end();
			} else {

				res.send(JSON.stringify({ "status": 200, "error": null, "response": [], "message :": "data saved", "success": true }));
				
				var searchTeleQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,substation_id) VALUES ?";
				var teleValue = [[req.body.session_id, ratingEvent, req.body.user_id, req.body.device_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode, req.body.substation_id]];

				onestation.query(searchTeleQuery, [teleValue], function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
						onestation.end();
					} else {
					 //	res.send(JSON.stringify({ "status": 200, "error": null, "response": [], "message :": "data saved", "success": true }));
						onestation.end();
					}
				});
			}
		});
	}

});
module.exports = router;

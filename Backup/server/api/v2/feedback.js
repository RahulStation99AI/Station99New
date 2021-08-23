var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var feedbackEvent = 20;
	var feedbackQuery = "INSERT INTO feedback (user_id,device_id,name,email,rating,message,fb_datetime) VALUES ?";
	var feedbackValue = [[req.body.user_id, req.body.device_id, req.body.user_name, req.body.email, req.body.rating, req.body.message, req.body.timestamp]];
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(feedbackQuery, [feedbackValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
				onestation.end();
			} else {
				
				res.send(JSON.stringify({ "status": 200, "error": null, "response": [], "message :": "data saved", "success": true }));

				var searchTeleQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,substation_id) VALUES ?";
				var teleValue = [[req.body.session_id, feedbackEvent, req.body.user_id, req.body.device_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode, req.body.substation_id]];

				onestation.query(searchTeleQuery, [teleValue], function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
						onestation.end();
					} else {
						// res.send(JSON.stringify({ "status": 200, "error": null, "response": [], "message :": "data saved", "success": true }));
						onestation.end();
					}
				});
			}
		});
	}


});
module.exports = router;

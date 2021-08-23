var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST like tab clicked  */
router.post('/', function (req, res, next) {
	var userId = req.body.user_id;
	var tabClicked = req.body.tab_clicked;
	var deviceId = req.body.device_id;
	var eventId = req.body.event_id;

	var insertUserInfo = "INSERT INTO user_telemetry (user_id,session_id,event_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
	var userValue = [[userId,req.body.session_id, eventId, deviceId, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);

		onestation.query(insertUserInfo, [userValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": true }));
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
				onestation.end();
			}
		});
	}

});

module.exports = router;

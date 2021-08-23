var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST session track with req body */
router.post('/', function (req, res, next) {
    var eventId;
    if (req.body.is_in_foreground == "true") {
        eventId = 26;
    } else {
        eventId = 27;
    }
    var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,substation_id) VALUES ?";
    var userValue = [[req.body.session_id, eventId, req.body.user_id, req.body.device_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode, req.body.substation_id]];
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(insertUserInfo, [userValue], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
                onestation.end();
            } else {
                //  console.log(messageValue);
                res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "data saved" }, "success": true }));
                onestation.end();
            }
        });
    }
});


module.exports = router;
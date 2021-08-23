var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');



/* POST api to save search telemetry*/
router.post('/', function (req, res, next) {
    var searchEvent = 18;
    var searchTeleQuery = "INSERT INTO user_telemetry (session_id,event_id,search_text,search_resp_size,user_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,substation_id) VALUES ?";
    var teleValue = [[req.body.session_id, searchEvent, req.body.search_text, req.body.search_resp_size, req.body.user_id, req.body.device_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode, req.body.substation_id]];
    var dbName = "station99";
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(searchTeleQuery, [teleValue], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
                onestation.end();
            } else {
                //  console.log(messageValue);
                res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "data saved" }, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
    }
});

module.exports = router;

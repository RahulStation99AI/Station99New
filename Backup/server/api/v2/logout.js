var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST logout req body */
router.post('/', function (req, res, next) {
    var signoutEvent=3;
    var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,substation_id,t_timestamp,country,city,zipcode) VALUES ?";
    var userValue = [[req.body.session_id,signoutEvent,req.body.user_id, req.body.device_id,  req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id,req.body.substation_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(insertUserInfo, [userValue], function (err, result) {
        if (err) {
            res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
            onestation.end();
        } else {
             // Update User Logout Field Query
            var userQuery = "update users set is_login = '0' where user_id = ?";
            var userData = [[req.body.user_id]];
            onestation.query(userQuery, [userData], function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": { "status": 0, "message": "", "result": result }, "success": false }));
                    onestation.end();
                }
            });
            // Update User Logout Field Query
            res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "You have successfully logged out" }, "success": true }));
            onestation.end();
        }
    });
}else{
    res.send(JSON.stringify({ "status": 500, "error":  "Invalid requent sent", "response": "Invalid requent sent", "success": false }));
}
});


module.exports = router;
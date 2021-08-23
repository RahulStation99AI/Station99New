var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST api to save search telemetry*/
router.post('/', function (req, res, next) {
    var impresssionEvent = 14;
    var ad_ids_val = req.body.ad_id;
    var ad_ids_arr = ad_ids_val.split(',');
    var total_ads_lenght = ad_ids_arr.length;
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var counters = 1;
        for(var i = 0;i < ad_ids_arr.length;i++){
            var inserImpressionQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,locale) VALUES ?";
            var teleValue = [[req.body.session_id, impresssionEvent, req.body.user_id, req.body.device_id, ad_ids_arr[i], req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp,req.body.country, req.body.city, req.body.zipcode, req.body.locale]];
            onestation.query(inserImpressionQuery, [teleValue], function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
                    onestation.end();
                } else {
                    if(total_ads_lenght === (counters)){
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": {  },"message :": "data saved", "success": true }));
                        onestation.end();
                    }
                    counters++;
                }
            });
        }
    }
});

module.exports = router;





// var express = require('express');
// var router = express.Router();
// var { GlobalDBHelper } = require('./GlobalDBHelper.js');

// /* POST api to save search telemetry*/
// router.post('/', function (req, res, next) {
//     var impresssionEvent = 14;
//     var inserImpressionQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,zipcode) VALUES ?";
//     var teleValue = [[req.body.session_id, impresssionEvent, req.body.user_id, req.body.device_id, req.body.ad_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.zipcode]];
//     //var dbName = req.headers.db_name;
//     var dbName = "kxa";
//     console.log(req.body);
//     if (dbName != null) {
//         var helper = new GlobalDBHelper(dbName);
//         var onestation = helper.getConnection(dbName);
//         onestation.query(inserImpressionQuery, [teleValue], function (err, result) {
//             if (err) {
//                 res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
//                 onestation.end();
//             } else {
//                 res.send(JSON.stringify({ "status": 200, "error": null, "response": {  },"message :": "data saved", "success": true }));
//                 onestation.end();
//             }
//         });
//     }
// });

// module.exports = router;

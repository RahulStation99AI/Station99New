var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST api to save search telemetry*/
router.post('/', function (req, res, next) {
    console.log(req.body);
    var impresssionEvent = 14;


    var age = req.body.age;
    if (typeof age === 'undefined') {
        age = 0;
    }

    var state = req.body.state;
    if (typeof state === 'undefined') {
        state = '';
    }

    var device_type = req.body.device_type;
    if (typeof device_type === 'undefined') {
        device_type = '';
    }


    var ad_ids_val = req.body.ad_id;
    var ad_ids_arr = ad_ids_val.split(',');
    
    
    var advertiser_name = req.body.advertiser_name;
    if(typeof advertiser_name === 'undefined'){
        var advertiser_name_arr = [];
    }else{
        var advertiser_name_arr = advertiser_name.split(',');
    }
    
    var total_ads_lenght = ad_ids_arr.length;
    var dbName = req.headers.db_name;
    // console.log(dbName);

    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var counters = 1;
        var advertiser_name_data = '';
        for(var i = 0;i < ad_ids_arr.length;i++){

            advertiser_name_data = advertiser_name_arr[i];

            if(typeof advertiser_name_data === 'undefined'){
                advertiser_name_data = '';
            }

            // console.log(advertiser_name_data);

            var inserImpressionQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,advertiser_name,user_type,gender,age,platform,app_version,os_version,latitude,longitude,radio_station_id,substation_id,country,state,city,zipcode,t_timestamp,device_type,locale) VALUES ?";
            var teleValue = [[req.body.session_id, impresssionEvent, req.body.user_id, req.body.device_id, ad_ids_arr[i],advertiser_name_data, req.body.user_type, req.body.gender,age, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id,'0', req.body.country, state, req.body.city, req.body.zipcode,req.body.t_timestamp, req.body.device_type,req.body.locale]];
            // var inserImpressionQuery = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,user_type,gender,age,platform,app_version,os_version,latitude,longitude,radio_station_id,substation_id,country,city,zipcode,t_timestamp,locale) VALUES ?";
            // var teleValue = [[req.body.session_id, impresssionEvent, req.body.user_id, req.body.device_id, ad_ids_arr[i], req.body.user_type, req.body.gender,user_age, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id,'0', req.body.country, req.body.city, req.body.zipcode,req.body.t_timestamp, req.body.locale]];
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

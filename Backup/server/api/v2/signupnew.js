var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST signup with req body */
router.post('/', function (req, res) {
    var registerEventId = 1;
    var user_id = 0;
    var session_id = "";
    var user_type = "registered";
    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    var email_id = req.body.email_id;
    var isSocialIdExist = 'SELECT * FROM users WHERE email_id = ? and social_id = ? and social_type = ?';
    //console.log("debug-----");
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        //console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        try {
            onestation.query(isSocialIdExist, [email_id, social_id, social_type], (error, resultUser, fields) => {
                if (error) {
                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                    onestation.end();
                } else {
                    var resData = resultUser[0];
                    console.log(resData);
                    if (typeof resData === "undefined") {
                        

                        var insertInUser = "INSERT INTO users (user_name,email_id,password,phone,image_url, gender,age, device_id, latitude, longitude, social_id, social_type, app_version, os_version, device_type, platform, locale,radio_station_id,zipcode,user_dob_date,is_login) VALUES ?";
                        var userValue = [[req.body.user_name, req.body.email_id, req.body.password, req.body.phone, req.body.image_url, req.body.gender, req.body.age, req.body.device_id, req.body.latitude, req.body.longitude, req.body.social_id, req.body.social_type, req.body.app_version, req.body.os_version, req.body.device_type, req.body.platform, req.body.locale, req.body.radio_station_id,req.body.zipcode,req.body.user_dob_date,'1']];
                        onestation.query(insertInUser, [userValue], function (err, result) {
                            if (err) {
                                res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
                                onestation.end();
                            } else {
                                onestation.query("SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,updated_At,created_At,tc_status,pp_status,zipcode FROM users WHERE email_id = ? and social_id = ? and social_type = ?", [email_id, social_id, social_type], function (err, userValue) {
                                    if (err) {
                                        res.send(JSON.stringify({ "status": 500, "error": err, "response": { "status": 0, "message": "", "result": userValue }, "success": false }));
                                        onestation.end();
                                    } else {
                                        user_id = userValue[0].user_id;
                                        //console.log(user_id);
                                        session_id = req.body.uuid+"_"+user_id+"_"+req.body.timestamp;
                                        
                                        res.send(JSON.stringify({ "status": 200, "error": null, "response": { "status": 1, "message": "Your are successfully signed up with us!", "result": userValue }, "success": true }));

                                        var now = new Date();
                                        var year = "" + now.getFullYear();
                                        var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
                                        var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
                                        var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
                                        var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
                                        var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
                                        var curr_date_time = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                                        //console.log(curr_date_time);
                                        //console.log(req.body);
                                        //var teleQuery = "INSERT INTO user_telemetry (user_id,session_id,gender,user_type,country,city,event_id,device_id,platform,app_version,os_version,latitude,longitude,t_timestamp,zipcode) VALUES ?";
                                       // var teleValue = [[user_id,session_id,req.body.gender,user_type,req.body.country,req.body.city,req.body.event_id, req.body.device_id, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, curr_date_time, req.body.zipcode]];
                                          var teleQuery = "INSERT INTO user_telemetry (user_id,session_id,gender,user_type,country,city,event_id,device_id,platform,app_version,os_version,latitude,longitude,radio_station_id,substation_id,t_timestamp,zipcode) VALUES ?";
                                          var teleValue = [[user_id,session_id,req.body.gender,user_type,req.body.country,req.body.city,req.body.event_id, req.body.device_id, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.substation_id, curr_date_time, req.body.zipcode]];
                                        onestation.query(teleQuery, [teleValue], function (err, result) {

                                        });
                                        //console.log(userValue);
                                        // status 1 is api hit successfully 
                                        //res.send(JSON.stringify({ "status": 200, "error": null, "response": { "status": 1, "message": "Your are successfully signed up with us!", "result": userValue }, "success": true }));
                                        onestation.end();
                                    }
                                });
                            }
                        });

                    } else {
                        if (social_id != null && social_id != "" && social_type != 2) {
                            // status 204 user has successfully signed up
                            res.send(JSON.stringify({ "status": 200, "error": error, "response": { "status": 204, "message": "Your are already signed up with us!", "result": resultUser }, "success": true }));
                            onestation.end();
                        } else {


                            var isSocialIdExist = `SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,
                            latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,updated_At,created_At,
                            tc_status,pp_status,zipcode FROM users WHERE email_id = ? and social_type = 2`;
                            onestation.query(isSocialIdExist, [email_id, social_type], (error, dataVal, fields) => {
                                if (error) {
                                    // status 0 is sqlite error
                                    res.send(JSON.stringify({ "status": 500, "error": error, "response": { "status": 0, "message": "", "result": dataVal }, "success": true }));
                                    onestation.end();
                                } else {
                                    user_id = dataVal[0].user_id;
                                    //console.log(user_id);
                                    session_id = req.body.uuid+"_"+user_id+"_"+req.body.timestamp;

                                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "status": 204, "message": "Your have already signed up with us!", "result": dataVal }, "success": true }));

                                    //var teleQuery = "INSERT INTO user_telemetry (user_id,session_id,gender,user_type,event_id,device_id,platform,app_version,os_version,latitude,longitude,substation_id,t_timestamp,country,city,zipcode) VALUES ?";
                                    //var teleValue = [[user_id,session_id,req.body.gender,user_type,req.body.event_id, req.body.device_id, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.substation_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
                                      var teleQuery = "INSERT INTO user_telemetry (user_id,session_id,gender,user_type,event_id,device_id,platform,app_version,os_version,latitude,longitude,radio_station_id,substation_id,t_timestamp,country,city,zipcode) VALUES ?";
                                      var teleValue = [[user_id,session_id,req.body.gender,user_type,req.body.event_id, req.body.device_id, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.substation_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
                                
                                    onestation.query(teleQuery, [teleValue], function (err, result) {
                                        // status 204 user has successfully signed up
                                        //res.send(JSON.stringify({ "status": 200, "error": error, "response": { "status": 204, "message": "Your have already signed up with us!", "result": dataVal }, "success": true }));
                                        onestation.end();
                                    });



                                }
                            });


                        }
                    }
                }
            });
        } catch (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "message": "Connection error", "success": false }));
        }
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "message": "Invalid requent sent", "success": false }));
    }

});


module.exports = router;



var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST login with req body */
router.post('/', function (req, res, next) {
    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    var loginEventId = 2;
    var isSocialIdExist = `SELECT * FROM users WHERE social_id = '` + social_id + `' and social_type = '` + social_type + `';`;

    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        //console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        try {
            onestation.query(isSocialIdExist, (error, resultUser, fields) => {
                if (error) {
                    res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
                    onestation.end();
                } else {
                    var resData = resultUser[0];
                    //console.log(resultUser);
                    if (typeof resData === "undefined") {
                        res.send(JSON.stringify({ "status": 200, "error": error, "response": [] }));
                        onestation.end();
                    } else {
                        if (resData.device_id === req.body.device_id) {
                            // if device id is same update social id and social type
                            if (req.body.latitude == null || req.body.latitude == '' || req.body.longitude == null || req.body.longitude == '') {
                                var updateQuery = "UPDATE users SET event_id=?,session_id=?,app_version=?, platform=?, locale=?, social_id=?, social_type=? WHERE device_id=?";
                                var updateValue = [req.body.event_id, req.body.session_id, req.body.app_version, req.body.platform, req.body.locale, social_id, social_type, req.body.device_id];
                            } else {
                                var updateQuery = "UPDATE users SET event_id=?,session_id=?,latitude = ?,longitude = ?,app_version=?, platform=?, locale=?, social_id=?, social_type=? WHERE device_id=?";
                                var updateValue = [req.body.event_id, req.body.session_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, social_id, social_type, req.body.device_id];
                            }
                            onestation.query(updateQuery, updateValue, function (err, result) {
                                if (error) {
                                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                    onestation.end();
                                } else {
                                    var isIdExist = `SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,
                                    latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,updated_At,created_At,
                                    tc_status,pp_status,zipcode FROM users WHERE social_id = ? and social_type = ?`;
                                    onestation.query(isIdExist, [social_id, social_type], (error, resultUserData, fields) => {
                                        if (error) {
                                            res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                            onestation.end();
                                        } else {
                                            res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));
                                            onestation.end();
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            // if device id is different, update device id
                            if (req.body.latitude == null || req.body.latitude == '' || req.body.longitude == null || req.body.longitude == '') {
                                var updateQuery = "UPDATE users SET event_id=?,session_id=?,app_version=?, platform=?, locale=?,device_id=? WHERE social_id = ? and social_type = ?";
                                var updateValue = [req.body.event_id, req.body.session_id, req.body.app_version, req.body.platform, req.body.locale, req.body.device_id, social_id, social_type];
                            } else {
                                var updateQuery = "UPDATE users SET event_id=?,session_id=?,latitude = ?,longitude = ?,app_version=?, platform=?, locale=?,device_id=? WHERE social_id = ? and social_type = ?";
                                var updateValue = [req.body.event_id, req.body.session_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, req.body.device_id, social_id, social_type];
                            }
                            onestation.query(updateQuery, updateValue, function (err, result) {
                                if (error) {
                                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                    onestation.end();
                                } else {
                                    var isSocialIdExist = `SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,
                                    latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,updated_At,created_At,
                                    tc_status,pp_status,zipcode FROM users WHERE social_id = ? and social_type = ?`;
                                    onestation.query(isSocialIdExist, [social_id, social_type], (error, resultUserData, fields) => {
                                        if (error) {
                                            res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                            onestation.end();
                                        } else {
                                            res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));
                                            onestation.end();
                                        }
                                    });
                                }
                            });
                        }
                    }
                    //   res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUser, "success": true }));

                }
            });
        } catch (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "message": "Connection error", "success": false }));
        }
    } else {
        res.send(JSON.stringify({ "status": 500, "error":  "Invalid requent sent", "response": [], "message": "Invalid requent sent", "success": false }));
    }
});



/* POST login with email and pwd req body */
router.post('/email', function (req, res, next) {
    var emailId = req.body.email_id;
    var loginEventId = 2;
    var isEmailIdExist = `SELECT * FROM users WHERE email_id = ? and social_type=2`;
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        // console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        try {
            onestation.query(isEmailIdExist, [emailId], (error, resultUser, fields) => {
                if (error) {
                    res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
                    onestation.end();
                } else {
                    var resData = resultUser[0];
                    if (typeof resData === "undefined") {
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
                        onestation.end();
                    } else {
                        var respPwd = "" + resData.password;
                        var reqPwd = "" + req.body.password;
                        if (respPwd.trim() === reqPwd.trim()) {

                            var userDataSet = [{
                                user_id: resData.user_id,
                                user_name: resData.user_name,
                                email_id: resData.email_id,
                                phone: resData.phone,
                                image_url: resData.image_url,
                                gender: resData.gender,
                                device_id: resData.device_id,
                                radio_station_id: resData.radio_station_id,
                                latitude: resData.latitude,
                                longitude: resData.longitude,
                                social_type: resData.social_type,
                                social_id: resData.social_id,
                                age: resData.age,
                                app_version: resData.app_version,
                                os_version: resData.os_version,
                                platform: resData.platform,
                                locale: resData.locale,
                                updated_At: resData.updated_At,
                                created_At: resData.created_At,
                                tc_status: resData.tc_status,
                                pp_status: resData.pp_status,
                                zipcode: resData.zipcode
                            }];

                            res.send(JSON.stringify({ "status": 200, "error": null, "response": userDataSet, "password_unmatched": false, "success": true }));

                        var now = new Date();
                        var year = "" + now.getFullYear();
                        var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
                        var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
                        var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
                        var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
                        var second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
                        var curr_date_time = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
                        

                        var session_id = req.body.uuid+"_"+resData.user_id+"_"+req.body.timestamp;
                        
                        var insertInUser = "INSERT INTO user_telemetry (user_id,session_id,gender,user_type,country,city,event_id,  device_id, latitude, longitude, app_version,os_version, platform,radio_station_id,t_timestamp,zipcode) VALUES ?";
                        var userValue = [[resData.user_id,session_id,resData.gender,'Registered',req.body.country,req.body.city,req.body.event_id, req.body.device_id, req.body.latitude, req.body.longitude, req.body.app_version,req.body.os_version, req.body.platform, req.body.radio_station_id, curr_date_time,req.body.zipcode]];

                            onestation.query(insertInUser, [userValue], function (err, result) {
                                if (err) {
                                    res.send(JSON.stringify({ "status": 500, "error": err, "response": resultUser, "password_unmatched": false, "success": false }));
                                    onestation.end();
                                } else {
                                    // var userDataSet = [{
                                    //     user_id: resData.user_id,
                                    //     user_name: resData.user_name,
                                    //     email_id: resData.email_id,
                                    //     phone: resData.phone,
                                    //     image_url: resData.image_url,
                                    //     gender: resData.gender,
                                    //     device_id: resData.device_id,
                                    //     radio_station_id: resData.radio_station_id,
                                    //     latitude: resData.latitude,
                                    //     longitude: resData.longitude,
                                    //     social_type: resData.social_type,
                                    //     social_id: resData.social_id,
                                    //     age: resData.age,
                                    //     app_version: resData.app_version,
                                    //     os_version: resData.os_version,
                                    //     platform: resData.platform,
                                    //     locale: resData.locale,
                                    //     updated_At: resData.updated_At,
                                    //     created_At: resData.created_At,
                                    //     tc_status: resData.tc_status,
                                    //     pp_status: resData.pp_status,
                                    //     zipcode: resData.zipcode
                                    // }];

                                    // res.send(JSON.stringify({ "status": 200, "error": null, "response": userDataSet, "password_unmatched": false, "success": true }));
                                    
                                // Update User Logout Field Query
                                var userQuery = "update users set is_login = '1' where user_id = ?";
                                var userData = [[resData.user_id]];
                                onestation.query(userQuery, [userData], function (err, result) {
                                    if (err) {
                                        res.send(JSON.stringify({ "status": 500, "error": err, "response": { "status": 0, "message": "", "result": result }, "success": false }));
                                        onestation.end();
                                    }
                                });
                                // Update User Logout Field Query

                                   
                                    onestation.end();
                                }
                            });
                            // we have to provide every data except password 

                        } else {
                            res.send(JSON.stringify({ "status": 500, "error": null, "response": [], "password_unmatched": true, "success": true }));
                            onestation.end();
                        }
                    }
                }
            });
        } catch (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "message": "Connection error", "success": false }));
        }
    } else {
        res.send(JSON.stringify({ "status": 500, "error":  "Invalid requent sent", "response": [], "message": "Invalid requent sent", "success": false }));
    }
});

module.exports = router;
var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST login with req body */
router.post('/', function (req, res, next) {
    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    var loginEventId = 2;
    var isSocialIdExist = 'SELECT * FROM users WHERE social_id = ? and social_type = ?';
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        //console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        try {
            onestation.query(isSocialIdExist, [social_id, social_type], (error, resultUser, fields) => {
                if (error) {
                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                    onestation.end();
                } else {
                    var resData = resultUser[0];
                    if (typeof resData === "undefined") {
                        res.send(JSON.stringify({ "status": 200, "error": error, "response": [] }));
                        onestation.end();
                    } else {
                        if (resData.device_id === req.body.device_id) {
                            // if device id is same update social id and social type
                            if (req.body.latitude == null || req.body.latitude == '' || req.body.longitude == null || req.body.longitude == '') {
                                var updateQuery = "UPDATE users SET session_id=?,app_version=?, platform=?, locale=?, social_id=?, social_type=? WHERE device_id=?";
                                var updateValue = [req.body.session_id, req.body.app_version, req.body.platform, req.body.locale, social_id, social_type, req.body.device_id];
                            } else {
                                var updateQuery = "UPDATE users SET session_id=?,latitude = ?,longitude = ?,app_version=?, platform=?, locale=?, social_id=?, social_type=? WHERE device_id=?";
                                var updateValue = [req.body.session_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, social_id, social_type, req.body.device_id];
                            }
                            onestation.query(updateQuery, updateValue, function (err, result) {
                                if (error) {
                                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                    onestation.end();
                                } else {
                                    var isDeviceIdExist = `SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,
                                    latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,updated_At,created_At,
                                    tc_status,pp_status,zipcode FROM users WHERE social_id = ? and social_type = ?`;
                                    onestation.query(isDeviceIdExist, [social_id, social_type], (error, resultUserData, fields) => {
                                        if (error) {
                                            res.send(JSON.stringify({ "status": 500, "error": error, "response": resultUserData }));
                                            onestation.end();
                                        } else {

                                            res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));

                                            var insertInUser = `INSERT INTO user_telemetry (event_id,session_id,device_id,latitude,longitude, app_version, platform, locale,radio_station_id,country,city,zipcode,t_timestamp,os_version,user_type) VALUES ?`;
                                            var userValue = [[req.body.event_id, req.body.session_id, req.body.device_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, req.body.radio_station_id, req.body.country, req.body.city, req.body.zipcode, req.body.t_timestamp, req.body.os_version, req.body.user_type]];
                                            onestation.query(insertInUser, [userValue], function (err, result) {
                                                if (err) {
                                                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result }));
                                                    onestation.end();
                                                } else {
                                                    // res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));
                                                    onestation.end();
                                                }
                                            });

                                        }
                                    });
                                }
                            });
                        }
                        else {
                            // if device id is different, update device id
                            if (req.body.latitude == null || req.body.latitude == '' || req.body.longitude == null || req.body.longitude == '') {
                                var updateQuery = "UPDATE users SET session_id=?,app_version=?, platform=?, locale=?,device_id=? WHERE social_id = ? and social_type = ?";
                                var updateValue = [req.body.session_id, req.body.app_version, req.body.platform, req.body.locale, req.body.device_id, social_id, social_type];
                            } else {
                                var updateQuery = "UPDATE users SET session_id=?,latitude = ?,longitude = ?,app_version=?, platform=?, locale=?,device_id=? WHERE social_id = ? and social_type = ?";
                                var updateValue = [req.body.session_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, req.body.device_id, social_id, social_type];
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
                                            res.send(JSON.stringify({ "status": 500, "error": error, "response": resultUserData }));
                                            onestation.end();
                                        } else {

                                            res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));

                                            var insertInUser = `INSERT INTO user_telemetry (event_id,session_id,device_id,latitude,longitude, app_version, platform, locale,radio_station_id,country,city,zipcode,t_timestamp,os_version,user_type) VALUES ?`;
                                            var userValue = [[req.body.event_id, req.body.session_id, req.body.device_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, req.body.radio_station_id, req.body.country, req.body.city, req.body.zipcode, req.body.t_timestamp, req.body.os_version, req.body.user_type]];
                                            onestation.query(insertInUser, [userValue], function (err, result) {
                                                if (err) {
                                                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result }));
                                                    onestation.end();
                                                } else {
                                                   // res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));
                                                    onestation.end();
                                                }
                                            });

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
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "message": "Invalid requent sent", "success": false }));
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
        //console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        try {
            onestation.query(isEmailIdExist, [emailId], (error, resultUser, fields) => {
                if (error) {
                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                    onestation.end();
                } else {
                    var resData = resultUser[0];
                    if (typeof resData === "undefined") {
                        res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
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
                            res.send(JSON.stringify({ "status": 200, "error": null, "response": userDataSet, "success": true }));

                            var insertInUser = `INSERT INTO user_telemetry (event_id,session_id,device_id,latitude,longitude, app_version, platform, locale,radio_station_id,country,city,zipcode,t_timestamp,os_version,user_type) VALUES ?`;
                            var userValue = [[req.body.event_id, req.body.session_id, req.body.device_id, req.body.latitude, req.body.longitude, req.body.app_version, req.body.platform, req.body.locale, req.body.radio_station_id, req.body.country, req.body.city, req.body.zipcode, req.body.t_timestamp, req.body.os_version, req.body.user_type]];
                            onestation.query(insertInUser, [userValue], function (err, result) {
                                if (err) {
                                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result }));
                                    onestation.end();
                                } else {
                                    // we have to provide every data except password 
                                    
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
                                    // res.send(JSON.stringify({ "status": 200, "error": null, "response": userDataSet, "success": true }));
                                    onestation.end();
                                }
                            });

                        } else {
                            res.send(JSON.stringify({ "status": 500, "error": null, "response": "You have entered wrong password", "success": false }));
                            onestation.end();
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
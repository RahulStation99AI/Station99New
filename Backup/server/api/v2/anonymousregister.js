var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST signup with req body for anonymous user*/
router.post('/', function (req, res, next) {

    var device_id = req.body.device_id;
    //{if device id exists in the  anonymous user db}
    let isDeviceIdAnymExist = "SELECT * FROM anonymous_user WHERE device_id=?";

    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

        onestation.query(isDeviceIdAnymExist, [device_id], (error, deviceIdresult, fields) => {
            if (error) {
                res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                onestation.end();
            } else {
                //if the result have length >0 it has value it means the device id exits in db
                if (deviceIdresult != 'undefined' && deviceIdresult.length > 0) {
                    if (req.body.latitude == null || req.body.latitude == '' || req.body.longitude == null || req.body.longitude == '') {
                        var updateUserInfo = "UPDATE anonymous_user SET app_version=?, platform=?, locale=?, os_version=?, device_type=?, predicted_country=?, predicted_state=?, predicted_city=?, predicted_zipcode=?, modified_at=? WHERE device_id=?";
                        var params = [req.body.appversion, req.body.platform, req.body.locale, req.body.os_version, req.body.device_type, req.body.country, req.body.state, req.body.city, req.body.zipcode, req.body.modified_date, device_id];
                    } else {
                        var updateUserInfo = "UPDATE anonymous_user SET latitude = ?,longitude = ?,app_version=?, platform=?, locale=?, os_version=?, device_type=?, predicted_latitude=?, predicted_longitude=?, predicted_country=?, predicted_state=?, predicted_city=?, predicted_zipcode=?, modified_at=? WHERE device_id=?";
                        var params = [req.body.latitude, req.body.longitude, req.body.appversion, req.body.platform, req.body.locale, req.body.os_version, req.body.device_type, req.body.latitude, req.body.longitude, req.body.country, req.body.state, req.body.city, req.body.zipcode, req.body.modified_date, device_id];
                    }
                    onestation.query(updateUserInfo, params, function (err, result) {
                        if (err) {
                            res.send(JSON.stringify({ "status": 500, "error": err, "response": null }));
                        } else {
                            onestation.query('SELECT * from users where device_id=?', device_id, function (error, resultValue, fields) {
                                if (error) {
                                    res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                } else {
                                    console.log(resultValue);
                                    if (resultValue != 'undefined' && resultValue.length > 0) {
                                        res.send(JSON.stringify({ "status": 200, "error": null, "response": { "isRegisteredUser": true }, "success": true }));
                                    } else {
                                        res.send(JSON.stringify({ "status": 200, "error": null, "response": { "isRegisteredUser": false }, "success": true }));
                                    }


                                    //If there is no error, all is good and response is 200OK.
                                }
                            });
                        }
                    });

                } else {
                    //if device id doesnot exist then save user data and then retrieve from the db and pass it in the response
                    // var insertUserInfo = "INSERT INTO anonymous_user (device_id, latitude, longitude,app_version, os_version, device_type, platform,  locale) VALUES ?";
                    // var userValue = [[device_id, req.body.latitude, req.body.longitude, req.body.app_version,req.body.os_version,req.body.device_type, req.body.platform, req.body.locale]];
                    var insertUserInfo = "INSERT INTO anonymous_user (device_id, latitude, longitude, app_version, os_version, device_type, platform,  locale, predicted_latitude, predicted_longitude, predicted_country, predicted_state, predicted_city, predicted_zipcode, modified_at) VALUES ?";
                    var userValue = [[device_id, req.body.latitude, req.body.longitude, req.body.appversion,req.body.os_version,req.body.device_type, req.body.platform, req.body.locale, req.body.latitude, req.body.longitude, req.body.country, req.body.state,req.body.city, req.body.zipcode, req.body.modified_date]];
                   
                    onestation.query(insertUserInfo, [userValue], function (err, result) {
                        if (err) {
                            res.send(JSON.stringify({ "status": 500, "error": err, "response": null }));
                        } else {
                            res.send(JSON.stringify({ "status": 200, "error": null, "response": { "isRegisteredUser": false }, "success": true }));
                            // onestation.query('SELECT * from anonymous_user where device_id=?', device_id, function (error, resultValue, fields) {
                            //     if (err) {
                            //         res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                            //     } else {
                            //         res.send(JSON.stringify({ "status": 200, "error": null, "response": { "isRegisteredUser": false }, "success": true }));
                            //         //If there is no error, all is good and response is 200OK.
                            //     }
                            // });
                        }
                    });
                }

                onestation.end();

            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }

});

module.exports = router;
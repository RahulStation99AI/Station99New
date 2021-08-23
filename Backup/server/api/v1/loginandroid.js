var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');
var jwt = require('jsonwebtoken');


/* POST login with req body */
router.post('/', function (req, res, next) {
    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    
    var isSocialIdExist = `SELECT * FROM users WHERE social_id = '` + social_id + `' and social_type = '` + social_type + `'`;
    var dbName = req.headers.db_name;
    
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(isSocialIdExist, (error, resultUser, fields) => {
           
            if (error) {
                // res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                res.send(JSON.stringify({ "status": 500, "error": error, "response": { "user_details":resultUser},"message": "Error while fetching record", "success": false }));
                onestation.end();
            } else {
                var resData = resultUser[0];
                
                if (typeof resData === "undefined") {
                    //res.send(JSON.stringify({ "status": 200, "error": error, "response": [] }));
                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":resData},"message": "User Not exists", "success": false }));
                    onestation.end();
                } else {

                    var updateQuery = "UPDATE users SET latitude = ?,longitude = ?,device_id = ?, app_version=?, platform=?, locale=? WHERE social_id=? and social_type=?";
                    var updateValue = [ req.body.latitude, req.body.longitude,req.body.device_id, req.body.app_version, req.body.platform, req.body.locale, social_id, social_type ];
                    
                    onestation.query(updateQuery, updateValue, function (err, result) {
                        if (error) {
                            //res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                            res.send(JSON.stringify({ "status": 500, "error": error, "response": { "user_details":[]},"message": updateValue, "success": false }));
                            onestation.end();
                        } else {
                            var isIdExist = `SELECT * FROM users WHERE social_id = ? and social_type = ?`;
                            onestation.query(isIdExist, [social_id, social_type], (error, resultUserData, fields) => {
                                if (error) {
                                    //res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":resultUserData},"message": "Error while fetching record", "success": false }));
                                    onestation.end();
                                } else {
                                    var resData = resultUserData[0];
                                    var userDataSet = {
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
                                        modified_at: resData.modified_at,
                                        created_At: resData.created_At,
                                        tc_status: resData.tc_status,
                                        pp_status: resData.pp_status,
                                        zipcode: resData.zipcode,
                                        can_we_contact: resData.can_we_contact ? true : false
                                    };
                                    //res.send(JSON.stringify({ "status": 200, "error": null, "response": resultUserData, "success": true }));
                                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":userDataSet},"message": "Login Successfull!", "success": true }));
                                    onestation.end();
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
    }
});

/* POST login with email and pwd req body */
router.post('/email', function (req, res, next) {
    var emailId = req.body.email_id;
    var loginEventId = 2;
    var isEmailIdExist = `SELECT *, (CASE WHEN can_we_contact = 1 THEN true ELSE false END) as can_we_contact FROM users WHERE email_id = ? and social_type=2`;
    var dbName = req.headers.db_name;
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(isEmailIdExist, [emailId], (error, resultUser, fields) => {
            if (error) {
               // console.log('Zdx');
                res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
                onestation.end();
            } else {
                var resData = resultUser[0];
                if (typeof resData === "undefined") {
                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":[], "password_unmatched": false }, "is_temporary_password":false,"message": "User Name not exist!", "success": false }));
                    onestation.end();
                } else {
                    var userDataSet = {
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
                        modified_at: resData.modified_at,
                        created_At: resData.created_At,
                        tc_status: resData.tc_status,
                        pp_status: resData.pp_status,
                        zipcode: resData.zipcode,
                        can_we_contact: resData.can_we_contact ? true : false
                    };

                    var respPwd = "" + resData.password;
                    var reqPwd = "" + req.body.password;
                
                    if (respPwd.trim() === reqPwd.trim()) {
                        var token = jwt.sign({ user_details: userDataSet }, 'station99', {
                            expiresIn: "1h"
                        });
                        res.send(JSON.stringify({ "status": 200, "error": error,"response": { "user_details":userDataSet, "password_unmatched": false }, "is_temporary_password":false,"message": "Login Successfull!", "token":token ,"success": true }));
                        onestation.end();
                    } else {
                        var decodePassword = Buffer.from(reqPwd, 'base64').toString('ascii');
                        console.log(Buffer.from("ze0yEgWuVh").toString('base64'));
                        var temporaryPasswordQuery = `CALL proc_check_user_temporary_password_exist( "` + resData.user_id + `","` + decodePassword + `")`;
                        onestation.query(temporaryPasswordQuery, function (error, results, fields) {
                            if (error) {
                                res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "success": false }));
                                onestation.end();
                            } else {
                                var resData = results[0][0];
                                if (resData.is_exist === "false") {
                                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":userDataSet, "password_unmatched": true },"message": "Password not matched! or May be password expired!", "is_temporary_password":false, "success": false }));
                                } else {
                                    var token = jwt.sign({ user_details: userDataSet }, 'station99', {
                                        expiresIn: "1h"
                                    });
                                    res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":userDataSet, "password_unmatched": true },"message": "Login with Temporary Password!", "is_temporary_password":true,"token":token, "success": true }));
                                }
                                onestation.end();
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": { "user_details":[], "password_unmatched": false }, "is_temporary_password":false,"message": "Invalid requent sent", "success": false }));
    }
});

module.exports = router;
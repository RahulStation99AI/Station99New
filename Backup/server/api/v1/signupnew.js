var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST signup with req body */
router.post('/', function (req, res) {
    var social_id = req.body.social_id;
    var social_type = req.body.social_type;
    var email_id = req.body.email_id;

    var can_we_contact = req.body.can_we_contact;
    var can_we_contact_val = 0;
    if(can_we_contact == "true"){
        var can_we_contact_val = 1;
    }else{
        var can_we_contact_val = 0;
    }
    var isSocialIdExist = 'SELECT * FROM users WHERE email_id = ? and social_id = ? and social_type = ?';
    var dbName = req.headers.db_name;
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(isSocialIdExist, [email_id, social_id, social_type], (error, resultUser, fields) => {
            if (error) {
                res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                onestation.end();
            } else {

                
                if (typeof resData === "undefined") {
                    var insertInUser = "INSERT INTO users (user_name,email_id,password,phone,image_url, gender,age, device_id, latitude, longitude, social_id, social_type, app_version,os_version, device_type, platform, locale,radio_station_id,country,city,zipcode,user_dob_date,is_login,can_we_contact) VALUES ?";
                    var userValue = [[req.body.user_name, req.body.email_id, req.body.password, req.body.phone, req.body.image_url, req.body.gender, req.body.age, req.body.device_id, req.body.latitude, req.body.longitude, req.body.social_id, req.body.social_type, req.body.app_version,req.body.os_version,req.body.device_type,req.body.platform, req.body.locale, req.body.radio_station_id, req.body.country, req.body.city, req.body.zipcode,req.body.user_dob_date,'1',can_we_contact_val]];
                    onestation.query(insertInUser, [userValue], function (err, result) {
                        if (err) {
                            res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
                            onestation.end();
                        } else {

                            onestation.query("SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,radio_station_id,latitude,longitude,social_type,social_id,age,app_version,os_version,platform,locale,modified_at,created_At,tc_status,pp_status,zipcode, (CASE WHEN can_we_contact = 1 THEN true ELSE false END) as can_we_contact FROM users WHERE email_id = ? and social_id = ? and social_type = ?", [email_id, social_id, social_type], function (err, userValue) {
                                if (err) {
                                    res.send(JSON.stringify({ "status": 500, "error": err, "response": { "user_details": [] },"message": "",  "success": false }));
                                    onestation.end();
                                } else {
                                    // user_id = userValue[0].user_id;
                                    var resData = userValue[0];
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
                                    res.send(JSON.stringify({ "status": 200, "error": null, "response": { "user_details":userDataSet},"message": "Thanks for signing up.", "success": true }));
                                    onestation.end();
                                }
                            });
                        }
                    });
                } else {

                    if (social_id != null && social_id != "" && social_type != 2) {

                        var resData = resultUser[0];
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
                        console.log(resData);
                        
                        // status 204 user has successfully signed up
                        res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details":userDataSet }, "message": "Your are already signed up with us!","success": false }));
                        onestation.end();
                        // console.log("null blank");
                    } else {
                        //  console.log("under email and social type");
                        var isSocialIdExist = `SELECT * FROM users WHERE email_id = ? and social_type = 2`;
                        onestation.query(isSocialIdExist, [email_id], (error, dataVal, fields) => {
                            if (error) {
                                // status 0 is sqlite error
                                res.send(JSON.stringify({ "status": 500, "error": error, "response": {  "user_details":[] }, "message": dataValresData,"success": false }));
                                onestation.end();
                            } else {
                                
                                var resData = dataVal[0];
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
                                res.send(JSON.stringify({ "status": 200, "error": error, "response": { "user_details": userDataSet },"message": "Your have already signed up with us!", "success": false }));
                                onestation.end();
                            }
                        });
                    }
                }
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": { "user_details":"" },"message": "Invalid requent sent", "success": false }));
    }
});

module.exports = router;



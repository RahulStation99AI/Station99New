var express = require('express');
const fs = require('fs');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');
var base64Img = require('base64-img');
var Dpath = require("path");
const shortid = require('shortid');
const dbConfig=require("../../dbconfig");
var nodemailer = require('nodemailer');
const Cryptr = require('cryptr');


const
     multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('image')
    , azureStorage = require('azure-storage')
    , getStream = require('into-stream')
    , containerName = 'images';

const handleError = (err, res) => {
    res.status(500);
    res.render('error', { error: err });
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${originalName}`;
};


/* API for get Account list from db */
router.post('/Login', function (req, res, next) {
    var user_name = req.body.user_name;
    var user_password = req.body.password;
    var user_role = req.body.user_role;
    var user_station = req.body.user_station;
    
    if(user_role == "station admin"){
        console.log('If condi');
        var dbName = req.headers.db_name;
        // var selectUserInfo = "select id as login_customer,station_id,name,email,website,db_name,password,portal_logo,name from radiostation where email = '"+user_name+"'";
        var selectUserInfo = "select su.id as login_customer,rs.station_id,rs.name,rs.email,rs.website,rs.db_name,su.password,rs.portal_logo from radio_station rs inner join station99_users su on su.station_id = rs.station_id where su.station_id = '"+user_station+"' and su.email_address = '"+user_name+"' and su.user_role = '1'";
        //console.log(selectUserInfo);
        if (dbName != null) {
            
            var helper = new GlobalDBHelper(dbName);
            var onestation = helper.getConnection(dbName);
            onestation.query(selectUserInfo, function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                    onestation.end();
                } else {
                    console.log(result);
                    if(result.length > 0){
                        if(result[0].password == user_password){
                            var result_arr = [];
                            result_arr = [{
                                login_customer: result[0].login_customer,
                                station_id: result[0].station_id,
                                name: result[0].name,
                                email: result[0].email,
                                website: result[0].website,
                                db_name: result[0].db_name,
                                name: result[0].name,
                                portal_logo: result[0].portal_logo,
                                company_id:result[0].login_customer,
                                is_admin: true,
                                is_customer: false,
                                is_report: false,
                                advertisher_name: "",
                                universal_db: dbName
                        }]

                            res.send(JSON.stringify({ "status": 200, "error": err, "response": result_arr,message:"", "success": false }));
                        }else{
                            //console.log('password unmatched');
                            res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"Please enter correct password", "success": false }));
                        }
                    
                    }else{
                        res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"User name not exists in our record", "success": false }));
                    }
                    onestation.end();
                }
            });
        } else {
            res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
        }

    }else if(user_role == "customer"){
       // console.log('else');
        var dbName = req.headers.db_name;
        var selectUserInfo = "select id as login_customer,station_id,db_name,portal_logo,name from radio_station where station_id = '"+user_station+"'";
        
        if (dbName != null) {

            var helper = new GlobalDBHelper(dbName);
            var onestation = helper.getConnection(dbName);
            onestation.query(selectUserInfo, function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                    onestation.end();
                } else {
                    onestation.end();
                    dbName = result[0].db_name;
                    console.log(dbName);
                    var helper = new GlobalDBHelper(dbName);
                   var onestationSecond = helper.getConnection(dbName);
                    var selectCustomerInfo = "select ﻿id as company_id,company,website as website,company_email as email,password as passwordss from customer_info where user_login_email = '"+user_name+"'";
                    
                   // res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"Please enter correct password", "success": false }));
                    console.log(selectCustomerInfo);
                    onestationSecond.query(selectCustomerInfo, function (err, resultCustomer) {
                        if (err) {
                            res.send(JSON.stringify({ "status": 500, "error": err, "response": resultCustomer, "success": false }));
                            onestationSecond.end();
                        } else {
                            console.log(resultCustomer);
                            
                            if(resultCustomer.length > 0){
                                if(resultCustomer[0].passwordss == user_password){
                                    var result_arr = [];
                                    result_arr = [{
                                        login_customer: result[0].login_customer,
                                        station_id: result[0].station_id,
                                        name: result[0].name,
                                        email: resultCustomer[0].email,
                                        website: resultCustomer[0].website,
                                        db_name: result[0].db_name,
                                        name: result[0].name,
                                        portal_logo: result[0].portal_logo,
                                        company_id: resultCustomer[0].company_id,
                                        is_admin: false,
                                        is_customer: true,
                                        is_report: false,
                                        advertisher_name: resultCustomer[0].company,
                                        universal_db: ""
                                }]
        
                                    res.send(JSON.stringify({ "status": 200, "error": err, "response": result_arr,message:"", "success": false }));
                                }else{
                                    //console.log('password unmatched');
                                    res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"Please enter correct password", "success": false }));
                                }
                            
                            }else{
                                res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"User name not exists in our record", "success": false }));
                            }
                            onestationSecond.end();

                        }
                    });

                }
            });
        } else {
            res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
        }
    }else if(user_role == "reports"){
        console.log('If condi');
        var dbName = req.headers.db_name;
        // var selectUserInfo = "select id as login_customer,station_id,name,email,website,db_name,password,portal_logo,name from radiostation where email = '"+user_name+"'";
        var selectUserInfo = "select su.id as login_customer,rs.station_id,rs.name,rs.email,rs.website,rs.db_name,su.password,rs.portal_logo from radio_station rs inner join station99_users su on su.station_id = rs.station_id where su.station_id = '"+user_station+"' and email_address = '"+user_name+"' and su.user_role = '2'";
        //console.log(selectUserInfo);
        if (dbName != null) {
            
            var helper = new GlobalDBHelper(dbName);
            var onestation = helper.getConnection(dbName);
            onestation.query(selectUserInfo, function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                    onestation.end();
                } else {
                    console.log(result);
                    if(result.length > 0){
                        if(result[0].password == user_password){
                            var result_arr = [];
                            result_arr = [{
                                login_customer: result[0].login_customer,
                                station_id: result[0].station_id,
                                name: result[0].name,
                                email: result[0].email,
                                website: result[0].website,
                                db_name: result[0].db_name,
                                name: result[0].name,
                                portal_logo: result[0].portal_logo,
                                company_id:result[0].login_customer,
                                is_admin: false,
                                is_customer: false,
                                is_report: true,
                                advertisher_name: "",
                                universal_db: dbName
                        }]

                            res.send(JSON.stringify({ "status": 200, "error": err, "response": result_arr,message:"", "success": false }));
                        }else{
                            //console.log('password unmatched');
                            res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"Please enter correct password", "success": false }));
                        }
                    
                    }else{
                        res.send(JSON.stringify({ "status": 200, "error": err, "response": [],message:"User name not exists in our record", "success": false }));
                    }
                    onestation.end();
                }
            });
        } else {
            res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
        }

    }
    
});


/* API for get Account list from db */
router.get('/CustomerList', function (req, res, next) {
    //console.log("inside api")
    var selectUserInfo = "SELECT ﻿id as Id,company as Company,company_email as companyemail,phone as phone,address1 as address,city as city,state as state,zipcode as zipcode, (CASE WHEN subscribed = '1' THEN 'Active' ELSE 'Inactive' END ) as issubscribed  FROM customer_info";
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                //console.log(result);
               // res.json(result);
                res.send(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.get('/Customer/:id', (req, res) => {
    var selectUserInfo = "SELECT ﻿id as Id,company as Company,phone as phone,address1 as address1,address2 as address2,country as country,city as city,state as state,zipcode as zipcode,website as website,industry as industry,company_email as company_email, user_login_email as user_login_email, password as password, subscribed as subscribed, is_ads_active as is_ads_active, is_special_ads_active as is_special_ads_active FROM customer_info where ﻿id=?";
    var userValue = req.params.id;
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, [userValue], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.json(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/GetLoginCustomer', (req, res) => {
    console.log(req.body);
    var isAdmin = req.body.is_admin;
    var isCustomer = req.body.is_customer;
    var userValue = req.body.loginUserId;
    var dbName = req.headers.db_name;
    if(isAdmin && !isCustomer){
        
        dbName = req.body.universalDB;
        var selectUserInfo = "select id as Id,name as Company,'' as company_email,email_address as user_login_email,phone_no as phone,address as address1,address2 as address2,country as country,state,city,zipcode,password,website,industry from station99_users where id=?";
        console.log("Admin is true");
    }else if(!isAdmin && isCustomer){
        
        var selectUserInfo = "SELECT ﻿id as Id,company as Company,phone as phone,address1 as address1,address2 as address2,country as country,city as city,state as state,zipcode as zipcode,website as website,industry as industry,company_email as company_email, user_login_email as user_login_email, password as password FROM customer_info where ﻿id=?";
        console.log("Customer is true");
    }
    if (dbName != null) {
        console.log(selectUserInfo);
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, [userValue], function (err, result) {
            
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.json(result[0]);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});


// Get All Campaign for a specific Advertisher

router.get('/CampaignList/:id', (req, res) => {
    var selectCampaigninfo = "select name,start_date as startDate,end_date as endDate,id as campaigninfoId,frequency_type as frequencyType from campaign_info where account_id =?";
    var accountId = req.params.id;
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectCampaigninfo, [accountId], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.json(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});

// Get All Campaign for a specific Advertisher


// Get All Campaign for a specific Advertisher

router.get('/getSpecificCampaign/:id', (req, res) => {
    var selectCampaigninfo = "select * from campaign_info where id =?";
    var accountId = req.params.id;
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectCampaigninfo, [accountId], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.json(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});

// Get All Campaign for a specific Advertisher

//rest api to create a new customer record into mysql database
router.post('/Addcustomer', function (req, res) {

    var selectCustomerId = "SELECT ﻿id as customer_id  FROM customer_info order by ﻿id desc limit 1";
    var dbName = req.headers.db_name;
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectCustomerId, function (err, customerResult) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                
                var customerAlliasId = parseInt(customerResult[0].customer_id)+1;
                var alliasId = customerAlliasId+'0';
                var insertQuery = "INSERT INTO customer_info (customer_allias_id,company,phone,address1,address2,country,city,state,zipcode,website,industry,company_email,user_login_email) VALUES ?";
                var ValueforSave = [[alliasId,req.body.business_name, req.body.phone_number, req.body.address,req.body.address2,req.body.country, req.body.city, req.body.state, req.body.zipcode, req.body.website_address, req.body.industry, req.body.CompanyEmail, req.body.CompanyEmail]];

            if (dbName != null) {
                
                onestation.query(insertQuery, [ValueforSave], function (err, result, fields) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                        onestation.end();
                    } else {

                        var insertAdvertsesQuery = "INSERT INTO advertiser_alias_new (advertiser_name,customer_allias_id) VALUES ?";
                        var advertiserValueforSave = [[req.body.business_name,alliasId]];

                        onestation.query(insertAdvertsesQuery, [advertiserValueforSave], function (err, result, fields) {
                            if (err) {
                                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                                onestation.end();
                            } else {
                                res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "Account Added Successfully" }, "success": true }));
                                onestation.end();
                            }
                        });
                    }
                });
            } else {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
            }
        }
    });
});


//rest api to update record into mysql database
router.put('/Updatecustomer', function (req, res) {
    console.log(req.body);
    var ValueforUpdate = [[req.body.Company, req.body.Phone, req.body.Address1, req.body.Address2, req.body.City, req.body.country, req.body.State, req.body.Zipcode, req.body.Website, req.body.Industry, req.body.user_login_email, req.body.password, req.body.subscribed, req.body.is_ads_active, req.body.is_special_ads_active, req.body.companyEmail, req.body.CompanyId]];
    var updatequery = "UPDATE `customer_info` SET `company`='" + req.body.Company + "',`phone`='" + req.body.Phone + "',`address1`='" + req.body.Address1 + "',`address2`='" + req.body.Address2 + "',`city`='" + req.body.City + "',`country`='" + req.body.country + "',`state`='" + req.body.State + "',`zipcode`='" + req.body.Zipcode + "',`website`='" + req.body.Website + "',`industry`='" + req.body.Industry + "',`user_login_email`='" + req.body.user_login_email + "',`password`='" + req.body.password + "',`subscribed`='" + req.body.subscribed + "',`is_ads_active`='" + req.body.is_ads_active + "',`is_special_ads_active`='" + req.body.is_special_ads_active + "',`company_email`='" + req.body.companyEmail + "' where `﻿id`='" + req.body.CompanyId + "'";
    console.log(updatequery);
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(updatequery, function (err, result, fields) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": null, "response": "Account Updated Successfully", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }

});

//rest api to update record into mysql database
router.put('/UpdateProfile', function (req, res) {
   // console.log(req.body);

    var isAdmin = req.body.is_admin;
    var isCustomer = req.body.is_customer;
    var CompanyId = req.body.loginUserId;
    var dbName = req.headers.db_name;
    var profileBS64 = req.body.profileBS64;

    var filename = "";
    if (profileBS64 != '') {
    
        filename = req.body.CompanyId + '_' + shortid.generate() + '_profile';
        var Res = saveImg(profileBS64, filename);
    }
    
    if(isAdmin && !isCustomer){
            
        dbName = req.body.universalDB; 
        // var updatequery = "update radiostation set name='" + req.body.Company + "',company_email = '" + req.body.companyEmail + "',email = '" + req.body.user_login_email + "',phone = '" + req.body.Phone + "',website = '" + req.body.Website + "',password = '" + req.body.password + "',address1 = '" + req.body.Address1 + "',address2 = '" + req.body.Address2 + "',city = '" + req.body.City + "',state = '" + req.body.State + "',country = '" + req.body.country + "',zipcode = '"+ req.body.Zipcode +"',industry = '" + req.body.Industry + "' where id='" + req.body.CompanyId + "'";
        var updatequery = "update station99_users set name='" + req.body.Company + "',email_address = '" + req.body.user_login_email + "',profile_image = '"+ filename +"',phone_no = '" + req.body.Phone + "',website = '" + req.body.Website + "',password = '" + req.body.password + "',address = '" + req.body.Address1 + "',address2 = '" + req.body.Address2 + "',city = '" + req.body.City + "',state = '" + req.body.State + "',country = '" + req.body.country + "',zipcode = '"+ req.body.Zipcode +"',industry = '" + req.body.Industry + "',modified_date=now() where id='" + req.body.CompanyId + "'";
        //console.log("Admin is true");
    }else if(!isAdmin && isCustomer){
        var updatequery = "UPDATE `customer_info` SET `company`='" + req.body.Company + "',profile_image = '"+ filename +"',`phone`='" + req.body.Phone + "',`address1`='" + req.body.Address1 + "',`address2`='" + req.body.Address2 + "',`city`='" + req.body.City + "',`country`='" + req.body.country + "',`state`='" + req.body.State + "',`zipcode`='" + req.body.Zipcode + "',`website`='" + req.body.Website + "',`industry`='" + req.body.Industry + "',`user_login_email`='" + req.body.user_login_email + "',`password`='" + req.body.password + "',`company_email`='" + req.body.companyEmail + "' where `﻿id`='" + req.body.CompanyId + "'";
    }

    //console.log(updatequery);
    
    if (dbName != null) {
      //  console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(updatequery, function (err, result, fields) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": null, "response": "Account Updated Successfully", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }

});


router.get('/getCampaign/:id', (req, res) => {
    var selectUserInfo = "SELECT * FROM campaign_info where account_id=?";
    var userValue = req.params.id;
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, [userValue], function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.json(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});


//rest api to create a new Campaign record into mysql database
router.post('/Addcampaign', uploadStrategy,function (req, res) {
    console.log(req.body);
    var imgPathMlb = '';
    var imgPathHSA = '';
    var imgPathFSA = '';
    var imgPathFSA1 = '';

    var spl_morning_slot_start = "";
    var spl_morning_slot_end = ""; 
    var spl_afternon_slot_start = ""; 
    var spl_afternon_slot_end = ""; 
    var spl_evening_slot_start = "";
    var spl_evening_slot_end = "";
    var spl_night_slot_1_start = ""; 
    var spl_night_slot_1_end = "";
    var spl_night_slot_2_start = "";
    var spl_night_slot_2_end = "";

    if(req.body.IsSpecialAd){
        console.log('true : '+req.body.IsSpecialAd);
        spl_morning_slot_start = req.body.morning_slot_start;
        spl_morning_slot_end = req.body.morning_slot_end;
        spl_afternon_slot_start = req.body.afternon_slot_start;
        spl_afternon_slot_end = req.body.afternon_slot_end;
        spl_evening_slot_start = req.body. evening_slot_start;
        spl_evening_slot_end = req.body.evening_slot_end;
        spl_night_slot_1_start = req.body.night_slot_1_start;
        spl_night_slot_1_end = req.body.night_slot_1_end;
        spl_night_slot_2_start = req.body.night_slot_2_start;
        spl_night_slot_2_end = req.body.night_slot_2_end;
    }
    var dbName = req.headers.db_name;
    if(req.body.isCampaignEdit == "true"){
        console.log('vikash true');
        console.log(req.body);

        if (req.body.RadioImage1 != '' && !req.body.MLAfileEdit) {
        
            var filename = req.body.accountId + '_' + shortid.generate() + '_MLB';
            imgPathMlb = filename;
            var Res = saveImg(req.body.RadioImage1, filename);
        }else{
            imgPathMlb = req.body.RadioImage1;
        }

        console.log('IMGPATHMLB : '+imgPathMlb);
        //return false;

        if (req.body.HSImage1 != '' && !req.body.HSAfileEdit) {
                var filename = req.body.accountId + '_' + shortid.generate() + '_HSA';
                imgPathHSA = filename;
                var Res = saveImg(req.body.HSImage1, filename);
        }else{
            imgPathHSA = req.body.HSImage1;
        }

        if (req.body.SpecialImage1 != '' && !req.body.FSAfileEdit) {
                var filename = req.body.accountId + '_' + shortid.generate() + '_FSA';
                imgPathFSA = filename;
                var Res = saveImg(req.body.SpecialImage1, filename);
        }else{
            imgPathFSA = req.body.SpecialImage1;
        }

        if (req.body.SpecialImage2 != '' && !req.body.FSAfile1Edit) {
                var filename = req.body.accountId + '_' + shortid.generate() + '_FSA';    
                imgPathFSA1 = filename;
                var Res = saveImg(req.body.SpecialImage2, filename);
        }else{
            imgPathFSA1 = req.body.SpecialImage2;
        }
        
        var updateQuery = "UPDATE `campaign_info` SET `name` = ?, `campaign_name` = ?, `start_date` = ?, `end_date` = ?, `frequency_type` = ?, `custom_frequency` = ?, `is_radio_ad` = ?, `is_home_screen_ad` = ?, `is_special_ad` = ?, `is_default_radio_ad` = ?, `is_default_home_screen_ad` = ?, `is_default_special_ad` = ?, `radio_title` = ?, `radio_description` = ?, `radio_title_color` = ?, `radio_desc_color` = ?, `radio_bg_color` = ?, `radio_title_size` = ?, `radio_desc_size` = ?, `radio_image1` = ?, `radio_image2` = ?, `hs_title` = ?, `hs_desc` = ?, `hs_title_color` = ?, `hs_desc_color` = ?, `hs_bg_color` = ?, `hs_title_size` = ?, `hs_desc_size` = ?, `hs_image1` = ?, `hs_image2` = ?, `special_title` = ?, `special_desc` = ?, `special_title_color` = ?, `special_desc_color` = ?, `special_bg_color` = ?, `special_title_size` = ?, `special_desc_size` = ?, `special_image1` = ?, `special_image2` = ?, `radio_custom_template` = ?, `hs_custom_template` = ?, `special_custom_template` = ?, `is_ts_morning` = ?, `is_ts_evening` = ?, `is_ts_afternoon` = ?, `is_ts_night` = ?, `morning_slot_start` = ?, `afternon_slot_start` = ?, `evening_slot_start` = ?, `night_slot_1_start` = ?, `night_slot_2_start` = ?, `morning_slot_end` = ?, `afternon_slot_end` = ?, `evening_slot_end` = ?, `night_slot_1_end` = ?, `night_slot_2_end` = ?, `spl_morning_slot_start` = ?, `spl_morning_slot_end` = ?, `spl_afternon_slot_start` = ?, `spl_afternon_slot_end` = ?, `spl_evening_slot_start` = ?, `spl_evening_slot_end` = ?, `spl_night_slot_1_start` = ?, `spl_night_slot_1_end` = ?, `spl_night_slot_2_start` = ?, `spl_night_slot_2_end` = ? WHERE `id` = ?";

       var customfrequency= req.body.customfrequency.length > 0 ?   req.body.customfrequency : '' ;
        //var ValueforUpdate = [[req.body.AccountName, req.body.campaignName, req.body.startDate, req.body.endDate, req.body.frequencyType, req.body.customfrequency, req.body.IsRadioAd, req.body.IsHomeScreenAd, req.body.IsSpecialAd, req.body.IsDefaultRadioAd, req.body.IsDefaultHomeScreenAd, req.body.IsDefaultSpecialAd, req.body.RadioTitle, req.body.RadioDescription, req.body.RadioTitleColor, req.body.RadioDescColor, req.body.RadioBGColor, req.body.RadioTitleSize, req.body.RadioDescSize, req.body.RadioImage1, req.body.RadioImage2, req.body.HSTitile, req.body.HSDesc, req.body.HSTitleColor, req.body.HSDescColor, req.body.HSBGColor, req.body.HSTitleSize, req.body.HSDescSize, req.body.HSImage1, req.body.HSImage2, req.body.SpecialTitle, req.body.SpecialDesc, req.body.SpecialTitleColor, req.body.SpecialDescColor, req.body.SpecialBGColor, req.body.SpecialTitleSize, req.body.SpecialDescSize, req.body.SpecialImage1, req.body.SpecialImage2, req.body.RadioCustomTemplate, req.body.HSCustomTemplate, req.body.SpecialCustomTemplate, req.body.IsTSMorning, req.body.IsTSEvening, req.body.IsTSAfternoon, req.body.IsTSNight, req.body.morning_slot_start, req.body.afternon_slot_start, req.body.evening_slot_start, req.body.night_slot_1_start, req.body.night_slot_2_start, req.body.morning_slot_end, req.body.afternon_slot_end, req.body.evening_slot_end, req.body.night_slot_1_end, req.body.night_slot_2_end, req.body.spl_morning_slot_start, req.body.spl_morning_slot_end, req.body.spl_afternon_slot_start, req.body.spl_afternon_slot_end, req.body.spl_evening_slot_start, req.body.spl_evening_slot_end, req.body.spl_night_slot_1_start, req.body.spl_night_slot_1_end, req.body.spl_night_slot_2_start, req.body.spl_night_slot_2_end, req.body.accountId]];
        var ValueforUpdate = [req.body.AccountName, req.body.campaignName, req.body.startDate, req.body.endDate, req.body.frequencyType, customfrequency, req.body.IsRadioAd, req.body.IsHomeScreenAd, req.body.IsSpecialAd, req.body.IsDefaultRadioAd, req.body.IsDefaultHomeScreenAd, req.body.IsDefaultSpecialAd, req.body.RadioTitle, req.body.RadioDescription, req.body.RadioTitleColor, req.body.RadioDescColor, req.body.RadioBGColor, req.body.RadioTitleSize, req.body.RadioDescSize, imgPathMlb, req.body.RadioImage2, req.body.HSTitile, req.body.HSDesc, req.body.HSTitleColor, req.body.HSDescColor, req.body.HSBGColor, req.body.HSTitleSize, req.body.HSDescSize, imgPathHSA, req.body.HSImage2, req.body.SpecialTitle, req.body.SpecialDesc, req.body.SpecialTitleColor, req.body.SpecialDescColor, req.body.SpecialBGColor, req.body.SpecialTitleSize, req.body.SpecialDescSize, imgPathFSA, imgPathFSA1, req.body.RadioCustomTemplate, req.body.HSCustomTemplate, req.body.SpecialCustomTemplate, req.body.IsTSMorning, req.body.IsTSEvening, req.body.IsTSAfternoon, req.body.IsTSNight, req.body.morning_slot_start, req.body.afternon_slot_start, req.body.evening_slot_start, req.body.night_slot_1_start, req.body.night_slot_2_start, req.body.morning_slot_end, req.body.afternon_slot_end, req.body.evening_slot_end, req.body.night_slot_1_end, req.body.night_slot_2_end, spl_morning_slot_start, spl_morning_slot_end, spl_afternon_slot_start, spl_afternon_slot_end, spl_evening_slot_start, spl_evening_slot_end, spl_night_slot_1_start, spl_night_slot_1_end, spl_night_slot_2_start, spl_night_slot_2_end, req.body.accountId];
    
        
        if (dbName != null) {
            var helper = new GlobalDBHelper(dbName);
            var onestation = helper.getConnection(dbName);
            console.log(updateQuery);
            onestation.query(updateQuery,ValueforUpdate, function (err, result, fields) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                    onestation.end();
                } else {
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": "Campaign Updated Successfully", "success": true }));
                    onestation.end();
                }
            });
        } else {
            res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
        }


    }else{
    
        if (req.body.RadioImage1 != '') {
        
                var filename = req.body.accountId + '_' + shortid.generate() + '_MLB';
                imgPathMlb = filename;
                var Res = saveImg(req.body.RadioImage1, filename);
        }

        if (req.body.HSImage1 != '') {
                var filename = req.body.accountId + '_' + shortid.generate() + '_HSA';
                imgPathHSA = filename;
                var Res = saveImg(req.body.HSImage1, filename);
        }

        if (req.body.SpecialImage1 != '') {
                var filename = req.body.accountId + '_' + shortid.generate() + '_FSA';
                imgPathFSA = filename;
                var Res = saveImg(req.body.SpecialImage1, filename);
        }

        if (req.body.SpecialImage2 != '') {
                var filename = req.body.accountId + '_' + shortid.generate() + '_FSA';
                imgPathFSA1 = filename;
                var Res = saveImg(req.body.SpecialImage2, filename);
        }
        

        var insertQuery = "INSERT INTO campaign_info (account_id,name,campaign_name,start_date, " +
            "end_date,frequency_type,custom_frequency,time_slot,is_radio_ad,is_home_screen_ad,is_special_ad,is_default_radio_ad,is_default_home_screen_ad,is_default_special_ad," +
            "radio_title,radio_description,radio_title_color,radio_desc_color,radio_bg_color,radio_title_size,radio_desc_size,radio_image1,radio_image2,hs_title," +
            "hs_desc,hs_title_color,hs_desc_color,hs_bg_color,hs_title_size,hs_desc_size,hs_image1,hs_image2,special_title,special_desc,special_title_color,special_desc_color," +
            "special_bg_color,special_title_size,special_desc_size,special_image1,special_image2,added_date,radio_custom_template,hs_custom_template,special_custom_template," +
            "is_ts_morning,is_ts_evening,is_ts_afternoon,is_ts_night, morning_slot_start,morning_slot_end, afternon_slot_start,afternon_slot_end,"+
            "evening_slot_start,evening_slot_end, night_slot_1_start,night_slot_1_end, night_slot_2_start, night_slot_2_end, spl_morning_slot_start,spl_morning_slot_end, spl_afternon_slot_start,spl_afternon_slot_end,spl_evening_slot_start,spl_evening_slot_end, spl_night_slot_1_start,spl_night_slot_1_end, spl_night_slot_2_start, spl_night_slot_2_end) VALUES ?";
        var ValueforSave = [[req.body.accountId,req.body.AccountName, req.body.campaignName, req.body.startDate, req.body.endDate, req.body.frequencyType, (req.body.customfrequency).toString(), req.body.timeSlot,
        req.body.IsRadioAd, req.body.IsHomeScreenAd, req.body.IsSpecialAd, req.body.IsDefaultRadioAd, req.body.IsDefaultHomeScreenAd, req.body.IsDefaultSpecialAd,
        req.body.RadioTitle, req.body.RadioDescription, req.body.RadioTitleColor, req.body.RadioDescColor, req.body.RadioBGColor, req.body.RadioTitleSize,
        req.body.RadioDescSize, imgPathMlb, req.body.RadioImage2, req.body.HSTitile, req.body.HSDesc, req.body.HSTitleColor, req.body.HSDescColor,
        req.body.HSBGColor, req.body.HSTitleSize, req.body.HSDescSize, imgPathHSA, req.body.HSImage2, req.body.SpecialTitle, req.body.SpecialDesc,
        req.body.SpecialTitleColor, req.body.SpecialDescColor, req.body.SpecialBGColor, req.body.SpecialTitleSize, req.body.SpecialDescSize, imgPathFSA,
            imgPathFSA1, req.body.AddedDate, req.body.RadioCustomTemplate, req.body.HSCustomTemplate, req.body.SpecialCustomTemplate,
        req.body.IsTSMorning, req.body.IsTSEvening, req.body.IsTSAfternoon, req.body.IsTSNight, req.body.morning_slot_start,req.body.morning_slot_end, req.body.afternon_slot_start,req.body.afternon_slot_end,
        req.body. evening_slot_start,req.body.evening_slot_end, req.body.night_slot_1_start,req.body.night_slot_1_end, req.body.night_slot_2_start, req.body.night_slot_2_end, spl_morning_slot_start,spl_morning_slot_end, spl_afternon_slot_start,spl_afternon_slot_end,spl_evening_slot_start,spl_evening_slot_end, spl_night_slot_1_start,spl_night_slot_1_end, spl_night_slot_2_start, spl_night_slot_2_end]];
        
        if (dbName != null) {
            var helper = new GlobalDBHelper(dbName);
            var onestation = helper.getConnection(dbName);
            onestation.query(insertQuery, [ValueforSave], function (err, result, fields) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                    onestation.end();
                } else {
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "Campaign Added Successfully" }, "success": true }));
                    onestation.end();
                }
            });
        } else {
            res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
        }
    }
});



function saveImg(rawdata, F_name) {

    var buffer = Buffer.from(rawdata, 'base64');
    const
          blobName = getBlobName(F_name)
        , stream = getStream(buffer)
        , streamLength = buffer.length
    ;
    
    const blobService = azureStorage.createBlobService(dbConfig.container,dbConfig.key);
    
    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

        if(err) {
            handleError(err);
            return;
        }
        console.log('success','File uploaded to Azure Blob storage.');
    
    });

}

router.post('/getUserByCountry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getUserByCountry = "SELECT country as name,count(distinct device_id) as total_slot_data FROM all_join_with_table_user_telemetry_advertisement_event_ids where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  country != '' group by country order by total_slot_data desc";
    var dbName = req.headers.db_name;
    
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getUserByCountry, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resultData = [];
                console.log(JSON.stringify(result[0]));
                var allAddCount = 0;
                if(result.length > 7){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<7){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){

                                resultData.sort(function (x, y) {
                                    return x.total_slot_data - y.total_slot_data;
                                });

                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{
                    
                    result.sort(function (x, y) {
                        return x.total_slot_data - y.total_slot_data;
                    });

                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

router.post('/getUserByCity', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getUserByCountry = "SELECT city as name,count(distinct device_id) as total_slot_data FROM all_join_with_table_user_telemetry_advertisement_event_ids where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  city != '' group by city order by total_slot_data desc;";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getUserByCountry, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resultData = [];
                console.log(JSON.stringify(result[0]));
                var allAddCount = 0;
                if(result.length > 10){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<10){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){
                                

                                resultData.sort(function (x, y) {
                                    return x.total_slot_data - y.total_slot_data;
                                });

                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{

                    result.sort(function (x, y) {
                        return x.total_slot_data - y.total_slot_data;
                    });

                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

router.post('/getUserByZipcode', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getUserByCountry = "SELECT zipcode as name,count(distinct device_id) as total_slot_data FROM all_join_with_table_user_telemetry_advertisement_event_ids where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  zipcode != '' group by zipcode order by total_slot_data desc";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getUserByCountry, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resultData = [];
                var allAddCount = 0;
                if(result.length > 10){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<10){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){
                                
                                resultData.sort(function (x, y) {
                                    return x.total_slot_data - y.total_slot_data;
                                });

                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{
                    
                    result.sort(function (x, y) {
                        return x.total_slot_data - y.total_slot_data;
                    });

                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getVisibleImpresionByRange', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    //var getUserByCountry = "SELECT country as name,count(distinct device_id) as total_slot_data FROM all_telemetry_join where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  country != '' group by country order by total_slot_data desc";
    var getVisibleImpresion = "select name,count(name) as total_slot_data from all_join_with_table_user_telemetry_advertisement_event_ids where name IS NOT NULL and date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') group by name order by total_slot_data desc";
    var dbName = req.headers.db_name;
    
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getVisibleImpresion, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                
                var resultData = [];
                var allAddCount = 0;
                if(result.length > 25){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<25){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){
                                
                                resultData.sort(function (x, y) {
                                    return x.total_slot_data - y.total_slot_data;
                                });

                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{
                    
                    result.sort(function (x, y) {
                        return x.total_slot_data - y.total_slot_data;
                    });

                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getUserByPlatform', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getUserByCountry = "SELECT platform as name,count(distinct device_id) as total_slot_data FROM all_join_with_table_user_telemetry_advertisement_event_ids where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  platform != '' group by platform order by total_slot_data asc";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getUserByCountry, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resultData = [];
                console.log(JSON.stringify(result[0]));
                var allAddCount = 0;
                if(result.length > 10){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<10){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){
                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getUserByGender', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getUserByCountry = "SELECT gender as name,count(distinct device_id) as total_slot_data FROM all_join_with_table_user_telemetry_advertisement_event_ids where date_format(t_timestamp,'%Y-%m-%d') BETWEEN date('"+startDate+"') AND date('"+endDate+"') and  gender != '' group by gender order by total_slot_data asc";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getUserByCountry, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resultData = [];
                console.log(JSON.stringify(result[0]));
                var allAddCount = 0;
                if(result.length > 10){
                    for(var i = 0; i < result.length; i++){
                        var arr1 = {};
                            if(i<10){
                                arr1['name'] = result[i].name;
                                arr1['total_slot_data'] = result[i].total_slot_data;
                                resultData.push(arr1);
                            }else{
                                allAddCount += result[i].total_slot_data;
                            }
        
                            if(i === (result.length-1)){
                                console.log('i'+i+' result.length '+(result.length-1));
                                arr1['name'] = 'Other';
                                arr1['total_slot_data'] = allAddCount;
                                resultData.push(arr1);
                            }
                    }
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData, "success": true }));
                }else{
                    res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                }
                //res.json(result[0]);
                
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getReportConfigurator', function (req, res, next) {
    console.log("inside api")

    var getReportConfigurator = "select report_name,report_id,status from report_configurator";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getReportConfigurator, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/getWebsiteTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationWebsiteClick = "call proc_get_station_website_click('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getSpecificWebsiteTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var advertisherName = req.body.advertisher_name;
    console.log("vikash advertisherName :::::::::::::::::::::::::::::::::::: "+advertisherName);
    var getStationWebsiteClick = "call proc_get_specific_station_website_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                // res.json(result[0]);
                // onestation.end();
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/getPhoneTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationWebsiteClick = "call proc_get_station_phone_click('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getSpecificPhoneTelemetry', function (req, res, next) {
    
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var advertisherName = req.body.advertisher_name;
    console.log("Advertisher name :- "+advertisherName);
    var getStationWebsiteClick = "call proc_get_specific_station_phone_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
    console.log("Vikash Kashyap : "+getStationWebsiteClick);
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                // console.log(JSON.stringify(result[0]));
                // res.json(result[0]);
                // onestation.end();
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getEmailTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationWebsiteClick = "call proc_get_station_email_click('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getSpecificEmailTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var advertisherName = req.body.advertisher_name;
    var getStationWebsiteClick = "call proc_get_specific_station_email_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                // console.log(JSON.stringify(result[0]));
                // res.json(result[0]);
                // onestation.end();
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/getFavouritesTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationWebsiteClick = "call proc_get_station_favourite_telemetry('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getSpecificFavouritesTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var advertisherName = req.body.advertisher_name;
    var getStationWebsiteClick = "call proc_get_specific_station_favourite_telemetry('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                // console.log(JSON.stringify(result[0]));
                // res.json(result[0]);
                // onestation.end();
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

router.post('/getImpressionTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationWebsiteClick = "call proc_get_station_impression_click('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/getDirectionTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationDirectionClick = "call proc_get_station_direction_click('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationDirectionClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getSpecificDirectionTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    var advertisherName = req.body.advertisher_name;
    var getStationWebsiteClick = "call proc_get_specific_station_direction_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
    //console.log("station id inside :" + dbName);
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationWebsiteClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                // console.log(JSON.stringify(result[0]));
                // res.json(result[0]);
                // onestation.end();
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});



router.post('/getZipcodeTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationDirectionClick = "call proc_get_station_zipcode('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationDirectionClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/getGenderTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.body.filter_by;
    var startDate = req.body.start_date;
    var endDate = req.body.end_date;
    console.log(filterBy);
    var getStationDirectionClick = "call proc_get_station_gender('"+startDate+"','"+endDate+"','"+filterBy+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(getStationDirectionClick, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                console.log(JSON.stringify(result[0]));
                //res.json(result[0]);
    
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0], "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

router.post('/addUserAccount', function (req, res, next) {
    console.log("inside api");
    var station_id = req.body.station_id;
    var name = req.body.name;
    var email_address = req.body.email_address;
    var phone_no = req.body.phone_no;
    var dob = req.body.dob;
    var gender = req.body.gender;
    var address = req.body.address;
    var address2 = req.body.address2;
    var country = req.body.country;
    var state = req.body.state;
    var city = req.body.city;
    var zipcode = req.body.zipcode;
    var profile_image = req.body.profile_image;
    var website = req.body.website;
    var industry = req.body.industry;
    var user_role = req.body.user_role;
    var apiPath = req.body.apiPath;
    var profileBS64 = req.body.profileBS64;
    var authentication_token = generateRandomNumber(25);
    var currentDateTime1 = currentDateTime();
    const cryptr = new Cryptr('station99');
    const encryptedString = cryptr.encrypt(currentDateTime1);
    const stationIdEncrypt = cryptr.encrypt(station_id);
    var filename = "";
    if (profileBS64 != '') {
    
        filename = station_id + '_' + shortid.generate() + '_profile';
        var Res = saveImg(profileBS64, filename);
    }
    var registerAdminUser = "call proc_register_admin('"+station_id+"','"+name+"','"+email_address+"','"+phone_no+"','"+dob+"','"+gender+"','"+address+"','"+address2+"','"+country+"','"+state+"','"+city+"','"+zipcode+"','"+filename+"','"+website+"','"+industry+"','"+user_role+"','"+authentication_token+"','"+currentDateTime1+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
        
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(registerAdminUser, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                var resu = result[0];
                
                var ActivateLink = "<b>Hi Mr. "+name+",</b><br/>Please click on below link and activate your account it will we valid for one day only.<br/> <a href="+apiPath+'api/v1/userActivateAccount'+'?auth-token='+authentication_token+'&elapsed='+encryptedString+'&station='+stationIdEncrypt+" >Click Here</a> to activate your account.";
                
                functionSendMail('Station99 Account Activation',ActivateLink);
                res.send(JSON.stringify({ "status": 200, "error": null, "response": resu[0].user_data, "success": true }));
                onestation.end();
            }
        });
        
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


function currentDateTime() {

    var date = new Date();
    var aaaa = date.getFullYear();
    var gg = date.getDate();
    var mm = (date.getMonth() + 1);

    if (gg < 10)
        gg = "0" + gg;

    if (mm < 10)
        mm = "0" + mm;

    var cur_day = aaaa + "-" + mm + "-" + gg;

    var hours = date.getHours()
    var minutes = date.getMinutes()
    var seconds = date.getSeconds();

    if (hours < 10)
        hours = "0" + hours;

    if (minutes < 10)
        minutes = "0" + minutes;

    if (seconds < 10)
        seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;

}


function generateRandomNumber(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 var functionSendMail = function(title,msg){
		
    let transport = nodemailer.createTransport({
        host: 'station99ai.com',
        port: 465,
        auth: {
            user: 'support@station99ai.com',
            pass: 'Station99@Support@I'
        }
    });

    const message = {
        from: 'support@station99ai.com', // Sender address
        to: 'manishgupta1890@gmail.com',         // List of recipients
        subject: title+' Production', // Subject line
        html: '<p>'+msg+'</p>' // Plain text body
    };

    transport.sendMail(message, function(err, info) {
        if (err) {
            // console.log(err);
            resolve('Error while sending mail');
        } else {
           // console.log(info);
            resolve('Success Mail has been send');
        }
    });
}




router.post('/validateUser', function (req, res, next) {
    
    var authToken = req.body.authToken;
    var elapsed = req.body.elapsed;
    var station_id = req.body.station_id;

    const cryptr = new Cryptr('station99');
    
    var elapsedTime = cryptr.decrypt(elapsed);
    var stationIdDecrypt = cryptr.decrypt(station_id);
    //elapsedTime = '2020-02-02 10:02:02';
    var validateUserQuery = "call proc_validate_user('"+stationIdDecrypt+"','"+elapsedTime+"','"+authToken+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(validateUserQuery, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {            
                var resu = result[0][0];
                res.send(JSON.stringify({ "status": 200, "error": null, "response": resu.data, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

router.post('/updateUserPassword', function (req, res, next) {
    
    var authToken = req.body.authToken;
    var elapsed = req.body.elapsed;
    var station_id = req.body.station_id;
    var userPassword = req.body.userPassword;

    const cryptr = new Cryptr('station99');
    
    var elapsedTime = cryptr.decrypt(elapsed);
    var stationIdDecrypt = cryptr.decrypt(station_id);
    // const encryptedUserPassword = cryptr.encrypt(userPassword);
     const encryptedUserPassword = userPassword;
    //elapsedTime = '2020-02-02 10:02:02';
    var updateUserQuery = "call proc_update_user_password('"+stationIdDecrypt+"','"+elapsedTime+"','"+authToken+"','"+encryptedUserPassword+"')";
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(updateUserQuery, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {            
                var resu = result[0][0];
                res.send(JSON.stringify({ "status": 200, "error": null, "response": resu.data, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.post('/addPrivacyPolicy', function (req, res, next) {
    
    var id = req.body.id;
    var radio_station_id = req.body.radio_station_id;
    var htmlData = req.body.htmlData; 
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

            if(id == 0){
                //var privacyPolicyQuery = "INSERT INTO `privacy_policy` (``,``,) VALUES ('"+radio_station_id+"','"+htmlData+"')";
                var insertInUser = "INSERT INTO privacy_policy (radio_station_id,privacy_policy_data) VALUES ?";
                var userValue = [[radio_station_id, htmlData]];
                onestation.query(insertInUser, [userValue], function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while create Record!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Data Saved!", "success": true }));
                        onestation.end();
                    }
                });
                            
            }else{
                var insertInUser = "update `privacy_policy` set  `radio_station_id` = ?,`privacy_policy_data`= ? where id = ?";
                var userValue = [radio_station_id, htmlData,id];
                onestation.query(insertInUser, userValue, function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Policy Updated Successfull!", "success": true }));
                        onestation.end();
                    }
                });
            }
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});

router.get('/getPrivacyPolicy', function (req, res, next) {
    var dbName = req.headers.db_name;
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "SELECT * FROM privacy_policy order by id desc limit 1";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                onestation.end();
            } else {            
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Policy Updated Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});



router.post('/addTermsCondition', function (req, res, next) {
    
    var id = req.body.id;
    var radio_station_id = req.body.radio_station_id;
    var htmlData = req.body.htmlData; 
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

            if(id == 0){
                var insertInUser = "INSERT INTO terms_and_condition (radio_station_id,terms_data) VALUES ?";
                var userValue = [[radio_station_id, htmlData]];
                onestation.query(insertInUser, [userValue], function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while create Record!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Data Saved!", "success": true }));
                        onestation.end();
                    }
                });
                            
            }else{
                var insertInUser = "update `terms_and_condition` set  `radio_station_id` = ?,`terms_data`= ? where id = ?";
                var userValue = [radio_station_id, htmlData,id];
                onestation.query(insertInUser, userValue, function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Policy Updated Successfull!", "success": true }));
                        onestation.end();
                    }
                });
            }
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});


router.get('/getTermsCondition', function (req, res, next) {
    var dbName = req.headers.db_name;
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "SELECT * FROM terms_and_condition order by id desc limit 1";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                onestation.end();
            } else {            
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Policy Updated Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});


router.post('/addContactUs', function (req, res, next) {
    
    var id = req.body.id;
    var radio_station_id = req.body.radio_station_id;
    var htmlData = req.body.htmlData; 
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

            if(id == 0){
                var insertInUser = "INSERT INTO contact_us (radio_station_id,contact_us_data) VALUES ?";
                var userValue = [[radio_station_id, htmlData]];
                onestation.query(insertInUser, [userValue], function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while create Record!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Data Saved!", "success": true }));
                        onestation.end();
                    }
                });
                            
            }else{
                var insertInUser = "update `contact_us` set  `radio_station_id` = ?,`contact_us_data`= ? where id = ?";
                var userValue = [radio_station_id, htmlData,id];
                onestation.query(insertInUser, userValue, function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Contact Us Updated Successfull!", "success": true }));
                        onestation.end();
                    }
                });
            }
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});


router.get('/getContactUs', function (req, res, next) {
    var dbName = req.headers.db_name;
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "SELECT * FROM contact_us order by id desc limit 1";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {            
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Data Fetch Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});



router.post('/addSaleAdvertising', function (req, res, next) {
    
    var id = req.body.id;
    var radio_station_id = req.body.radio_station_id;
    var htmlData = req.body.htmlData; 
    var dbName = req.headers.db_name;
   
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

            if(id == 0){
                var insertInUser = "INSERT INTO sale_advertising (radio_station_id,sale_advertising_data) VALUES ?";
                var userValue = [[radio_station_id, htmlData]];
                onestation.query(insertInUser, [userValue], function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while create Record!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Data Saved!", "success": true }));
                        onestation.end();
                    }
                });
                            
            }else{
                var insertInUser = "update `sale_advertising` set  `radio_station_id` = ?,`sale_advertising_data`= ? where id = ?";
                var userValue = [radio_station_id, htmlData,id];
                onestation.query(insertInUser, userValue, function (err, result) {
                    if (err) {
                        res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Updating Policy!", "success": false }));
                        onestation.end();
                    } else {            
                        res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Contact Us Updated Successfull!", "success": true }));
                        onestation.end();
                    }
                });
            }
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});


router.get('/getSaleAdvertising', function (req, res, next) {
    var dbName = req.headers.db_name;
    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "SELECT * FROM sale_advertising order by id desc limit 1";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {            
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Data Fetch Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
    
});


/* API for get Account list from db */
router.get('/HomeFeed', function (req, res, next) {
    //console.log("inside api")
    var selectUserInfo = "select id,title,image_url,feed_date,feed_time,status,created_at from connect_fm_home_feed;";
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});

module.exports = router;
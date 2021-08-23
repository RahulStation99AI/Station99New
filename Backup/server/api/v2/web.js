var express = require('express');
const fs = require('fs');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');
var base64Img = require('base64-img');
var Dpath = require("path");
const shortid = require('shortid');
const dbConfig=require("../../dbconfig");

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
router.get('/Login', function (req, res, next) {

    var user_name = req.query.user_name;
    var dbName = req.headers.db_name;
    var selectUserInfo = "select station_id,name,email,website,db_name,password from radiostation where email = '"+user_name+"'";
    
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectUserInfo, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": err, "response": result, "success": false }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


/* API for get Account list from db */
router.get('/CustomerList', function (req, res, next) {
    console.log("inside api")
    var selectUserInfo = "SELECT ﻿CompanyId as Id,Company FROM customerinfo_aliased";
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
                console.log(JSON.stringify(result));
                res.json(result);
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }
});


router.get('/Customer/:id', (req, res) => {
    var selectUserInfo = "SELECT ﻿CompanyId as Id,Company FROM customerinfo where ﻿CompanyId=?";
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

//rest api to create a new customer record into mysql database
router.post('/Addcustomer', function (req, res) {
    var insertQuery = "INSERT INTO customerinfo (Company,Phone,Address1,City,State,Zipcode,Website,Industry,Record_Manager,IDorStatus,IsWeb,Facebook_page_link,Twitter_page_link,Other_info,CompanyEmail) VALUES ?";
    var ValueforSave = [[req.body.Company, req.body.Phone, req.body.Address1, req.body.City, req.body.State, req.body.Zipcode, req.body.Website, req.body.Industry, req.body.Record_Manager, req.body.IDorStatus, req.body.IsWeb, req.body.Facebook_page_link, req.body.Twitter_page_link, req.body.Other_info, req.body.CompanyEmail]];
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(insertQuery, [ValueforSave], function (err, result, fields) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "Account Added Successfully" }, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }
});


//rest api to update record into mysql database
router.put('/Updatecustomer', function (req, res) {
    var ValueforUpdate = [[req.body.Company, req.body.Phone, req.body.Address1, req.body.Address2, req.body.City, req.body.State, req.body.Zipcode, req.body.Website, req.body.Industry, req.body.Record_Manager, req.body.Facebook_page_link, req.body.Twitter_page_link, req.body.Other_info, req.body.CompanyEmail, req.body.CompanyId]];
    var updatequery = 'UPDATE `customerinfo` SET `Company`=?,`Phone`=?,`Address1`=?,`Address2`=?,`City`=?,`State`=?,`Zipcode`=?,`Website`=?,`Industry`=?,`Record_Manager`=?,`Facebook_page_link`=?,`Twitter_page_link`=?,`Other_info`=?,`CompanyEmail`=? where `CompanyId`=?';
    var dbName = req.headers.db_name;
    if (dbName != null) {
        console.log("station id inside :" + dbName);
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(updatequery, [ValueforUpdate], function (err, result, fields) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
                onestation.end();
            } else {
                res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": "Account Updated Successfully" }, "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
    }

});


router.get('/getCampaign/:id', (req, res) => {
    var selectUserInfo = "SELECT * FROM campaigninfo where accountId=?";
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
    var imgPathMlb = '';
    var imgPathHSA = '';
    var imgPathFSA = '';
    var imgPathFSA1 = '';

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

    var insertQuery = "INSERT INTO campaigninfo (accountId,name,campaignName,startDate, " +
        "endDate,frequencyType,customfrequency,timeSlot,IsRadioAd,IsHomeScreenAd,IsSpecialAd,IsDefaultRadioAd,IsDefaultHomeScreenAd,IsDefaultSpecialAd," +
        "RadioTitle,RadioDescription,RadioTitleColor,RadioDescColor,RadioBGColor,RadioTitleSize,RadioDescSize,RadioImage1,RadioImage2,HSTitile," +
        "HSDesc,HSTitleColor,HSDescColor,HSBGColor,HSTitleSize,HSDescSize,HSImage1,HSImage2,SpecialTitle,SpecialDesc,SpecialTitleColor,SpecialDescColor," +
        "SpecialBGColor,SpecialTitleSize,SpecialDescSize,SpecialImage1,SpecialImage2,AddedDate,RadioCustomTemplate,HSCustomTemplate,SpecialCustomTemplate," +
        "IsTSMorning,IsTSEvening,IsTSAfternoon,IsTSNight, morning_slot_start,morning_slot_end, afternon_slot_start,afternon_slot_end,"+
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
    var dbName = req.headers.db_name;
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



router.get('/getWebsiteTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


router.get('/getSpecificWebsiteTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
    var advertisherName = req.query.advertisher_name;
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



router.get('/getPhoneTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


router.get('/getSpecificPhoneTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
    var advertisherName = req.query.advertisher_name;
    var getStationWebsiteClick = "call proc_get_specific_station_phone_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
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


router.get('/getEmailTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


router.get('/getSpecificEmailTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
    var advertisherName = req.query.advertisher_name;
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



router.get('/getFavouritesTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


router.get('/getSpecificFavouritesTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
    var advertisherName = req.query.advertisher_name;
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

router.get('/getImpressionTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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



router.get('/getDirectionTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


router.get('/getSpecificDirectionTelemetry', function (req, res, next) {
    console.log("inside api")
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
    var advertisherName = req.query.advertisher_name;
    var getStationWebsiteClick = "call proc_get_specific_station_website_click('"+startDate+"','"+endDate+"','"+advertisherName+"','"+filterBy+"')";
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



router.get('/getZipcodeTelemetry', function (req, res, next) {
    console.log("inside api");
    var filterBy = req.query.filter_by;
    var startDate = req.query.start_date;
    var endDate = req.query.end_date;
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


module.exports = router;
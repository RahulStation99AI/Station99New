var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* GET delay for web application. */
router.post('/', function (req, res, next) {
    //var dbName = req.headers.db_name;
    var dbName = "kxa";
    var app_version = req.body.app_version;
	var app_platform = req.body.app_platform;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var appControlQuery = `CALL proc_get_app_control("` + app_version + `", "` + app_platform + `" )`;

        onestation.query(appControlQuery, function (error, results, fields) {
            if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
                // console.log(results[0]);
                var resultArr = [];
                var resultData = results[0];
               // console.log(resultData[0].app_version);
              //  console.log(resultData[0].app_platform);
                var is_show_popup = false;
                var is_forced_update = false;
                var is_app_processing = false;
                if(resultData[0].app_version != app_version ){
                    console.log('App Version Changed : '+resultData[0].app_version);
                    if(resultData[0].is_show_popup != 0){
                        is_show_popup = true;
                    }

                    if(resultData[0].is_forced_update != 0){
                        is_forced_update = true;
                    }

                    if(resultData[0].is_app_processing != 0){
                        is_app_processing = true;
                    }
                
                }
                resultArr.push({is_show_popup:is_show_popup,is_forced_update:is_forced_update,is_app_processing:is_app_processing,message:resultData[0].message}); 
                console.log(resultArr);
				res.send(JSON.stringify({ "status": 200, "error": null, "response": resultArr, "success": true }));
				//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}


});

module.exports = router;

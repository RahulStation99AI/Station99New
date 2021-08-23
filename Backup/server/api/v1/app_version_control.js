var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* GET delay for web application. */
router.post('/', function (req, res, next) {
    var dbName = req.headers.db_name;

    var app_version_user = req.body.app_version;
	var app_platform = req.body.app_platform;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var appControlQuery = `CALL proc_get_app_control("` + app_version_user + `", "` + app_platform + `" )`;

        onestation.query(appControlQuery, function (error, results, fields) {
            if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
                var resultArr = [];
                var resultData = results[0];
                var is_show_popup = false;
                var is_forced_update = false;
                var is_app_processing = false;
               
                var app_version_user_arr = app_version_user.split('.');
                var app_version_without_dot = '';
                for(var i = 0; i<app_version_user_arr.length; i++){
                    app_version_without_dot += app_version_user_arr[i];
                }
                
                var app_version = parseInt(app_version_without_dot);

                var db_app_version_details = resultData[0].app_version;
                var db_app_version_arr = db_app_version_details.split('.');


                var db_app_version_without_dot = '';
                for(var i = 0; i<db_app_version_arr.length; i++){
                    db_app_version_without_dot += db_app_version_arr[i];
                }

                var db_app_version = parseInt(db_app_version_without_dot);

                //console.log('app_version : '+app_version)
               // console.log('db_app_version : '+db_app_version);

                if( app_version < db_app_version ){
                    
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
                //console.log(resultArr);
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

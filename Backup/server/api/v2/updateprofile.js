var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST api to call update profile. */
router.put('/', function (req, res, next) {
	var updateProfileQuery = `UPDATE users SET user_name ='` + req.body.user_name + `', gender='` + req.body.gender + `',age=` + req.body.age + `,phone='` + req.body.phone + `',zipcode='` + req.body.zipcode + `' WHERE user_id=` + req.body.user_id;

	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(updateProfileQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var userQuery = `SELECT user_id,user_name,email_id,phone,image_url,gender,device_id,
				radio_station_id,latitude,longitude,social_type,social_id,age,app_version,os_version,
				platform,locale,updated_At,created_At,tc_status,pp_status,zipcode FROM users WHERE user_id = `+req.body.user_id;
				//console.log(userQuery);
				onestation.query(userQuery, function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						onestation.end();
					} else {
						res.send(JSON.stringify({ "status": 200, "error": err, "response": result, "success": true }));
						onestation.end();
					}

				});
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});

module.exports = router;

var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST api to call update profile. */
router.put('/', function (req, res, next) {
	
	var can_we_contact = req.body.can_we_contact;
    var can_we_contact_val = 0;
    if(can_we_contact == "true"){
        var can_we_contact_val = 1;
    }else{
        var can_we_contact_val = 0;
    }

	var updateProfileQuery = `UPDATE users SET user_name ='` + req.body.user_name + `', gender='` + req.body.gender + `',age=` + req.body.age + `,phone='` + req.body.phone + `',zipcode='` + req.body.zipcode + `',can_we_contact=`+can_we_contact_val+` WHERE user_id=` + req.body.user_id;

	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(updateProfileQuery, function (error, results, fields) {
			if (error) {
				// res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				res.send(JSON.stringify({ "status": 500, "error": err, "response": { "user_details":[]},"message": "error while updating record!", "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var userQuery = `SELECT * FROM users WHERE user_id = `+req.body.user_id;
				onestation.query(userQuery,  function (err, result) {
					if (err) {
			//			res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						res.send(JSON.stringify({ "status": 500, "error": err, "response": { "user_details":[]},"message": "error while getting user!", "success": false }));
						onestation.end();
					} else {
						var resData = result[0];
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
						//res.send(JSON.stringify({ "status": 200, "error": err, "response": {"message":"Profile Updated Successfully"}, "success": true }));
						res.send(JSON.stringify({ "status": 200, "error": err, "response": { "user_details":userDataSet},"message": "Profile Updated Successfully!", "success": true }));
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
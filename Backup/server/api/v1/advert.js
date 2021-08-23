var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* post advertisement listing. */
router.post('/advertList', function (req, res, next) {
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;

	var adFeedQuery = `CALL get_radio_customer_campaigns_data(` + userId + `, "` + reqAirdate + `" , "` + reqAirtime + `" , "` + deviceId + `" )`;
	
	var dbName = req.headers.db_name;
	if (dbName != null) {
		//console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(adFeedQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				
				var resData = results[0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": resData, "success": true }));
					//If there is no error, all is good and response is 200OK.
					onestation.end();
				}

			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}


});


/* POST like ad feed */
router.post('/', function (req, res, next) {
	
	var ad_feed_id = req.body.ad_id;
	var programId = req.body.program_id;
	var isLiked = req.body.is_liked;
	var deviceId = req.body.device_id;
	var messageValue = "";

	if (isLiked === "true") {
		isLiked = "true";
		adlikeEvent = 4;
		messageValue = "You liked this advertisement";
	} else {
		messageValue = "You disliked this advertisement";
		isLiked = "false";
		adlikeEvent = 15;
	}

	if (req.body.user_id != null && req.body.user_id != 0) {
		var userFavListQuery = "SELECT * FROM user_fav WHERE user_id =" + req.body.user_id +
			" and advert_id= '" + ad_feed_id + "' and id >=0;";
		console.log(userFavListQuery);
	} else {
		var userFavListQuery = "SELECT * FROM user_fav WHERE device_id = '" + req.body.device_id +
			"' and advert_id= '" + ad_feed_id + "' and id >=0;";
		console.log(userFavListQuery);
	}
	var dbName = req.headers.db_name;
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(userFavListQuery, function (error, queryResult, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				onestation.end();
			} else {
				if (queryResult != 'undefined' && queryResult.length > 0) {
			
					if (req.body.user_id) {
						var updateUserInfo = "UPDATE user_fav SET is_ad_liked= '" + isLiked + "' WHERE user_id = " + req.body.user_id + " and advert_id= '" + ad_feed_id + "' and ad_id= '" + programId + "' and id >=0";
						//console.log(updateUserInfo);
					} else {
						var updateUserInfo = "UPDATE user_fav SET is_ad_liked= '" + isLiked + "' WHERE device_id = '" + deviceId + "' and advert_id= '" + ad_feed_id + "' and ad_id= '" + programId + "' and id >=0";
						//console.log(updateUserInfo);
					}
					onestation.query(updateUserInfo, function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
							onestation.end();
						} else {
							res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
							onestation.end();
						}
					});
				} else {
					var insertInfo = "INSERT INTO user_fav (user_id,ad_id,is_ad_liked,device_id,advert_id) VALUES ?";
					var insertValue = [[req.body.user_id, programId, isLiked, deviceId, ad_feed_id]];
					onestation.query(insertInfo, [insertValue], function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
							onestation.end();
						} else {
							res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
							onestation.end();
						}
					});
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": {}, "success": false }));
	}
});

module.exports = router;
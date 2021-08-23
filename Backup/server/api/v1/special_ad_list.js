var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');



/* GET special advertisement listing. */
router.post('/', function (req, res, next) {

	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	var dbName = req.headers.db_name;
	var helper = new GlobalDBHelper(dbName);
	var onestation = helper.getConnection(dbName);
	var specialQuery = `CALL proc_get_special_add( "` + reqAirdate + `" , "` + reqAirtime + `", "` + userId + `", "` + deviceId + `" )`;
	onestation.query(specialQuery, function (error, results, fields) {
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
			//If there is error, we send the error in the error section with 500 status
			onestation.end();
		} else {
			var resData = results[0];
			if (typeof resData === "undefined") {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
			} else {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": resData, "success": true }));
			}
			//If there is no error, all is good and response is 200OK
			onestation.end();
		}
	});
});


/* POST like SPECIAL ad feed */
router.post('/likeAd', function (req, res, next) {
	var ad_feed_id = req.body.ad_id;
	var isLiked = req.body.is_liked;
	var deviceId = req.body.device_id;
	var messageValue = "";
	console.log(isLiked);
	if (isLiked === "true") {
		isLiked = "true";
		adlikeEvent = 28;
		messageValue = "You liked this advertisement";
	} else {
		messageValue = "You disliked this advertisement";
		isLiked = "false";
		adlikeEvent = 29;
	}

	if (req.body.user_id != null && req.body.user_id != 0) {
		var userFavListQuery = "SELECT * FROM user_spl_ads WHERE user_id =" + req.body.user_id + " and spl_advert_id= '" + ad_feed_id + "'";
	} else {
		var userFavListQuery = "SELECT * FROM user_spl_ads WHERE device_id = '" + req.body.device_id + "' and spl_advert_id= '" + ad_feed_id + "'";
	}

	var dbName = req.headers.db_name;
	var helper = new GlobalDBHelper(dbName);
	var connection = helper.getConnection(dbName);
	connection.query(userFavListQuery, function (error, queryResult, fields) {
		
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			connection.end();
		} else {
			if (queryResult != 'undefined' && queryResult.length > 0) {
			
				if (req.body.user_id) {
					var updateUserInfo = "UPDATE user_spl_ads SET is_ad_liked= '" + isLiked + "' WHERE user_id = " + req.body.user_id + " and spl_advert_id= '" + ad_feed_id + "' and id >=0";
					//console.log(updateUserInfo);
				} else {
					var updateUserInfo = "UPDATE user_spl_ads SET is_ad_liked= '" + isLiked + "' WHERE device_id = '" + deviceId + "' and spl_advert_id= '" + ad_feed_id + "' and id >=0";
					//console.log(updateUserInfo);
				}
				connection.query(updateUserInfo, function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						connection.end();
					} else {

						res.send(JSON.stringify({ "status": 200, "error": err, "response": [], "message :": messageValue, "success": true }));
					}
				});

			} else {
				
				var insertInfo = "INSERT INTO user_spl_ads (user_id,is_ad_liked,device_id,spl_advert_id) VALUES ?";
				var insertValue = [[req.body.user_id, isLiked, deviceId, ad_feed_id]];
				//console.log(isLiked);
				connection.query(insertInfo, [insertValue], function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						connection.end();
					} else {
						res.send(JSON.stringify({ "status": 200, "error": err, "response": [], "message :": messageValue, "success": true }));
					}
				});
			}
		}
	});
});

module.exports = router;

var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* GET special advertisement listing. */
router.post('/', function (req, res, next) {
	var tabId = "special_ads";
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
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
		console.log(messageValue);
	} else {
		messageValue = "You disliked this advertisement";
		isLiked = "false";
		adlikeEvent = 29;
		console.log(messageValue);
	}

	if (req.body.user_id != null && req.body.user_id != 0) {
		var userFavListQuery = "SELECT * FROM user_spl_ads WHERE user_id =" + req.body.user_id + " and spl_advert_id= '" + ad_feed_id + "'";
		console.log(userFavListQuery);
	} else {
		var userFavListQuery = "SELECT * FROM user_spl_ads WHERE device_id = '" + req.body.device_id + "' and spl_advert_id= '" + ad_feed_id + "'";
		console.log(userFavListQuery);
	}
	//console.log('vikash');

	//var dbName = req.headers.db_name;
	var dbName = "kxa";

	var helper = new GlobalDBHelper(dbName);
	var connection = helper.getConnection(dbName);
	connection.query(userFavListQuery, function (error, queryResult, fields) {
		
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			connection.end();
		} else {
			if (queryResult != 'undefined' && queryResult.length > 0) {
				console.log("have data");
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

						var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,is_ad_liked,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
						var userValue = [[req.body.session_id, adlikeEvent, req.body.user_id, deviceId, ad_feed_id, isLiked, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
						console.log(isLiked);
						connection.query(insertUserInfo, [userValue], function (err, result) {
							if (err) {
								res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
								connection.end();
							} else {
								// res.send(JSON.stringify({ "status": 200, "error": err, "response": [], "message :": messageValue, "success": true }));
								connection.end();
							}
						});
					}
				});

			} else {
				console.log(" doesnot have data");
				var insertInfo = "INSERT INTO user_spl_ads (user_id,is_ad_liked,device_id,spl_advert_id) VALUES ?";
				var insertValue = [[req.body.user_id, isLiked, deviceId, ad_feed_id]];
				//console.log(isLiked);
				connection.query(insertInfo, [insertValue], function (err, result) {
					if (err) {
						res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						connection.end();
					} else {

						res.send(JSON.stringify({ "status": 200, "error": err, "response": [], "message :": messageValue, "success": true }));

						var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,is_ad_liked,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
						var userValue = [[req.body.session_id, adlikeEvent, req.body.user_id, deviceId, ad_feed_id, isLiked, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];

						connection.query(insertUserInfo, [userValue], function (err, result) {
							if (err) {
								res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
								connection.end();
							} else {
								// res.send(JSON.stringify({ "status": 200, "error": err, "response": [], "message :": messageValue, "success": true }));
								connection.end();
							}
						});
					}
				});
			}
		}
	});



});


/* GET liked special ads. */
router.post('/getLikedAds', function (req, res, next) {
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var reqAirdate = req.body.req_airdate;
	var reqAirtime = req.body.req_airtime;
	// if (req.body.user_id == null || req.body.user_id == 0) {
	// 	var selectDataQuery = `SELECT spl_advert_id from user_spl_ads where device_id= '` + deviceId + `' and is_ad_liked = 'true'`;
	// 	console.log("under device " + selectDataQuery);
	// } else {
	// 	var selectDataQuery = `SELECT spl_advert_id from user_spl_ads where user_id= ` + userId + ` and is_ad_liked = 'true'`;
	// 	console.log("under user " + selectDataQuery);
	// }

	var selectDataQuery = `CALL proc_get_special_favourite_add(` + userId + `, "` + reqAirdate + `" , "` + reqAirtime + `" , "` + deviceId + `" )`;
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	var helper = new GlobalDBHelper(dbName);
	var connection = helper.getConnection(dbName);

	connection.query(selectDataQuery, function (error, results, fields) {
	//	console.log(results);
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": [] }));
			connection.end();
			//If there is error, we send the error in the error section with 500 status
		} else {
			res.send(JSON.stringify({ "status": 200, "error": error, "response": results[0], "success": true }));
			connection.end();
			//If there is no error, all is good and response is 200OK.
		}
	});

});

module.exports = router;

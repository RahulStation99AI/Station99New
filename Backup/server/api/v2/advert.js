var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* post advertisement listing. */
router.post('/advertList', function (req, res, next) {
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
//	var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		// if (userId != null && userId != 0) {
		// 	var adFeedQuery = `select advert.id,advert.name,advert.airtime,str_to_date(concat(advert.airdate, ' ', advert.airtime)
		// ,'%Y-%m-%d %H:%i:%s')
		//  as airdate,advert.length,advert.advert_url,advert.advert_type,
		// advert.program_id, COALESCE(is_ad_liked,'false') as is_ad_fav,
		// COALESCE(customerinfo.CompanyEmail,'') as email,
		// COALESCE(customerinfo.Website,'') as website,COALESCE(customerinfo.Phone,'') as phone,
		// COALESCE(customerinfo.Address1,'') as address1,COALESCE(customerinfo.City,'') as city,
		// COALESCE(customerinfo.State,'') as state,COALESCE(customerinfo.Zipcode,'') as zipcode,
		// case
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=0 then '12 am-1 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=1 then '1 am-2 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=2 then '2 am-3 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=3 then '3 am-4 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=4 then '4 am-5 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=5 then '5 am-6 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=6 then '6 am-7 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=7 then '7 am-8 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=8 then '8 am-9 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=9 then '9 am-10 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=10 then '10 am-11 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=11 then '11 am-12 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=12 then '12 pm-1 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=13 then '1 pm-2 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=14 then '2 pm-3 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=15 then '3 pm-4 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=16 then '4 pm-5 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=17 then '5 pm-6 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=18 then '6 pm-7 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=19 then '7 pm-8 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=20 then '8 pm-9 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=21 then '9 pm-10 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=22 then '10 pm-11 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=23 then '11 pm-12 am'
		// END as hour_slot 
		// from (select * from advertisement left join
		// (select advert_id,is_ad_liked from user_fav where user_id=`+ userId + ` and is_ad_liked='true') userFav on
		// userFav.advert_id = advertisement.id) advert left join customerinfo on advert.name=customerinfo.Company
		// where CAST(Concat(advert.airdate,' ',advert.airtime) AS DATETIME) >= DATE_ADD(CAST('` + reqAirdate + ` ` + reqAirtime + `' AS DATETIME), INTERVAL -4 Hour) 
		// and CAST(Concat(advert.airdate,' ',advert.airtime) AS DATETIME) <= DATE_ADD(CAST('` + reqAirdate + ` ` + reqAirtime + `' AS DATETIME), INTERVAL 4 Hour) ORDER BY airdate DESC`;
		// } else {

		// 	var adFeedQuery = `select advert.id,advert.name,advert.airtime,str_to_date(concat(advert.airdate, ' ', advert.airtime)
		// ,'%Y-%m-%d %H:%i:%s')
		//  as airdate,advert.length,advert.advert_url,advert.advert_type,
		// advert.program_id, COALESCE(is_ad_liked,'false') as is_ad_fav,
		// COALESCE(customerinfo.CompanyEmail,'') as email,
		// COALESCE(customerinfo.Website,'') as website,COALESCE(customerinfo.Phone,'') as phone,
		// COALESCE(customerinfo.Address1,'') as address1,COALESCE(customerinfo.City,'') as city,
		// COALESCE(customerinfo.State,'') as state,COALESCE(customerinfo.Zipcode,'') as zipcode,
		// case
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=0 then '12 am-1 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=1 then '1 am-2 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=2 then '2 am-3 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=3 then '3 am-4 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=4 then '4 am-5 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=5 then '5 am-6 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=6 then '6 am-7 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=7 then '7 am-8 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=8 then '8 am-9 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=9 then '9 am-10 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=10 then '10 am-11 am'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=11 then '11 am-12 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=12 then '12 pm-1 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=13 then '1 pm-2 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=14 then '2 pm-3 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=15 then '3 pm-4 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=16 then '4 pm-5 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=17 then '5 pm-6 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=18 then '6 pm-7 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=19 then '7 pm-8 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=20 then '8 pm-9 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=21 then '9 pm-10 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=22 then '10 pm-11 pm'
		// when cast(SUBSTR(CAST(airtime AS CHAR),1,2) as UNSIGNED)=23 then '11 pm-12 am'
		// END as hour_slot 
		// from (select * from advertisement left join
		// (select advert_id,is_ad_liked from user_fav where device_id='`+ deviceId + `' and is_ad_liked='true') userFav on
		// userFav.advert_id = advertisement.id) advert left join customerinfo on advert.name=customerinfo.Company
		// where CAST(Concat(advert.airdate,' ',advert.airtime) AS DATETIME) >= DATE_ADD(CAST('` + reqAirdate + ` ` + reqAirtime + `' AS DATETIME), INTERVAL -4 Hour) 
		// and CAST(Concat(advert.airdate,' ',advert.airtime) AS DATETIME) <= DATE_ADD(CAST('` + reqAirdate + ` ` + reqAirtime + `' AS DATETIME), INTERVAL 4 Hour)  ORDER BY airdate DESC`;

		// }
		var adFeedQuery = `CALL get_radio_customer_campaigns_data(` + userId + `, "` + reqAirdate + `" , "` + reqAirtime + `" , "` + deviceId + `" )`;
		onestation.query(adFeedQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var resData = results[0];
			if (typeof resData === "undefined") {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
			} else {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": resData, "success": true }));
				//If there is no error, all is good and response is 200OK.
			}
			//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});

	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}


});




/* POST ad feed email/website/phone/address click api*/
router.post('/clickfeed', function (req, res, next) {
	var ad_feed_id = req.body.ad_id;
	var clickedEvent = req.body.clicked_event;
	var deviceId = req.body.device_id;
	var event_id;
	// 1 for email, 2 for phone, 3 for website, 4 for address 
	//ad phone error click=22,
	//ad email error click=23,ad website error click=24,ad address error click=25  
	if (clickedEvent == 1) {
		event_id = 11;
	} else if (clickedEvent == 2) {
		event_id = 10;
	} else if (clickedEvent == 3) {
		event_id = 12;
	} else if (clickedEvent == 4) {
		event_id = 13;
	} else if (clickedEvent == 22) {
		event_id = 22;
	} else if (clickedEvent == 23) {
		event_id = 23;
	} else if (clickedEvent == 24) {
		event_id = 24;
	} else {
		event_id = 25;
	}

	var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode,substation_id) VALUES ?";

	var userValue = [[req.body.session_id, event_id, req.body.user_id, deviceId, ad_feed_id, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode, req.body.substation_id]];
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(insertUserInfo, [userValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": {}, "success": false }));
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": {}, "success": true }));
				onestation.end();
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
	}

});





/* POST like ad feed */
router.post('/', function (req, res, next) {

	var ad_feed_id = req.body.ad_id;
	var programId = req.body.program_id;
	var isLiked = req.body.is_liked;
	var deviceId = req.body.device_id;
	var messageValue = "";
	console.log(isLiked);
	if (isLiked === "true") {
		isLiked = "true";
		adlikeEvent = 4;
		messageValue = "You liked this advertisement";
		console.log(messageValue);
	} else {
		messageValue = "You disliked this advertisement";
		isLiked = "false";
		adlikeEvent = 15;
		console.log(messageValue);
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

	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(userFavListQuery, function (error, queryResult, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			} else {
				if (queryResult != 'undefined' && queryResult.length > 0) {
					console.log("have data");
					if (req.body.user_id) {
						var updateUserInfo = "UPDATE user_fav SET is_ad_liked= '" + isLiked + "' WHERE user_id = " + req.body.user_id + " and advert_id= '" + ad_feed_id + "' and ad_id= '" + programId + "' and id >=0";
						console.log(updateUserInfo);
					} else {
						var updateUserInfo = "UPDATE user_fav SET is_ad_liked= '" + isLiked + "' WHERE device_id = '" + deviceId + "' and advert_id= '" + ad_feed_id + "' and ad_id= '" + programId + "' and id >=0";
						console.log(updateUserInfo);
					}
					onestation.query(updateUserInfo, function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						} else {

							res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));

							var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,is_ad_liked,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
							var userValue = [[req.body.session_id, adlikeEvent, req.body.user_id, deviceId, ad_feed_id, isLiked, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
							console.log(isLiked);
							onestation.query(insertUserInfo, [userValue], function (err, result) {
								if (err) {
									res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
								} else {
									// res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
								}
							});
							onestation.end();
						}
					});


				} else {
					console.log(" doesnot have data");
					var insertInfo = "INSERT INTO user_fav (user_id,ad_id,is_ad_liked,device_id,advert_id) VALUES ?";
					var insertValue = [[req.body.user_id, programId, isLiked, deviceId, ad_feed_id]];
					console.log(isLiked);
					onestation.query(insertInfo, [insertValue], function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						} else {
							
							res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));

							var insertUserInfo = "INSERT INTO user_telemetry (session_id,event_id,user_id,device_id,ad_id,is_ad_liked,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
							var userValue = [[req.body.session_id, adlikeEvent, req.body.user_id, deviceId, ad_feed_id, isLiked, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
							console.log(isLiked);
							onestation.query(insertUserInfo, [userValue], function (err, result) {
								if (err) {
									res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
								} else {
									// res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
								}
							});
							onestation.end();
						}
					});
				}
			}
		});


	} else {
		res.send(JSON.stringify({ "status": 500, "error": err, "response": "Invalid requent sent", "success": false }));
	}

});

module.exports = router;
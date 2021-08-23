var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST like song */
router.post('/', function (req, res, next) {

	//var likedDate = req.body.liked_date;
	//var likedTime = req.body.liked_time;
	var isSongLiked = req.body.is_song_liked;
	var isSongDisLiked = req.body.is_song_disliked;
	var deviceId = req.body.device_id;
	var songStatus;
	var teleCode;
	var format = '%d-%m-%Y';
	var songId = req.body.song_id;
	console.log(songId);

	var messageValue = "";
	console.log(isSongLiked);
	console.log(isSongDisLiked);


	if (isSongLiked === "true") {
		isSongLiked = "true";
		messageValue = "You liked this song";
		console.log(messageValue);
		songStatus = 1;
		teleCode = 5;
	} else if (isSongDisLiked === "true") {
		messageValue = "You disliked this song";
		isSongDisLiked = "true";
		console.log(messageValue);
		songStatus = 2;
		teleCode = 16;
	} else {
		messageValue = "You revert your operation on song";
		isSongLiked = "false";
		isSongDisLiked = "false";
		songStatus = 0;
		teleCode = 17;
		console.log(messageValue);

	}

	if (req.body.user_id != null && req.body.user_id != 0) {
		var isSongExist = `SELECT * FROM user_songs WHERE user_id = ` + req.body.user_id + ` and song_id='` + songId + `'`;
		console.log(isSongExist);
	} else {
		var isSongExist = `SELECT * FROM user_songs WHERE device_id = '` + req.body.device_id + `' and song_id='` + songId + `'`;
		console.log(isSongExist);
	}

	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);


		onestation.query(isSongExist, function (error, queryResult, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
			} else {
				
				res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));

				if (queryResult != 'undefined' && queryResult.length > 0) {
					console.log("have data");
					if (req.body.user_id) {
						var updateUserInfo = "UPDATE user_songs SET song_status= '" + songStatus + "' WHERE user_id = " + req.body.user_id + " and song_id= '" + songId + "' and id >=0";
						console.log(updateUserInfo);
					} else {
						var updateUserInfo = "UPDATE user_songs SET song_status= '" + songStatus + "' WHERE device_id = '" + deviceId + "' and song_id= '" + songId + "' and id >=0";
						console.log(updateUserInfo);
					}
					onestation.query(updateUserInfo, function (err, result) {
						if (err) {
							//res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						} else {
							//console.log(messageValue);
							//res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
						}
					});
				} else {
					console.log(" doesnot have data");
					var insertSongQuery = "INSERT INTO user_songs (user_id,device_id,song_id,song_status) VALUES ?";
					var songValue = [[req.body.user_id, deviceId, songId, songStatus]];
					console.log(songValue);
					onestation.query(insertSongQuery, [songValue], function (err, result) {
						if (err) {
							// res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
						} else {
							//res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
						}
					});
				}
			}
		});


		var teleQuery = "INSERT INTO user_telemetry (session_id,user_id,device_id,song_id,event_id,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,t_timestamp,country,city,zipcode) VALUES ?";
		var teleValue = [[req.body.session_id, req.body.user_id, deviceId, songId, teleCode, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
		console.log(teleValue);
		onestation.query(teleQuery, [teleValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
				onestation.end();
			} else {
				// res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
				onestation.end();
			}
		});



	}


	// var queryvalue = "SELECT * FROM song_detail where air_date ='" + likedDate + "' and start_time <= '" + likedTime + "' and end_time >='" + likedTime + "';";

	// connection.query(queryvalue, function (error, songDetailResult, fields) {
	// 	if (error) {
	// 		res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
	// 		//If there is error, we send the error in the error section with 500 status
	// 	} else {
	// 		var resData = songDetailResult[0];
	// 		var messageValue = "";
	//         console.log(isLiked);
	// 		if (isLiked === "true") {
	// 			messageValue = "You liked this song";
	// 			console.log(messageValue);
	// 		} else {
	// 			messageValue = "You disliked this song";
	// 			isLiked="false";
	// 			console.log(messageValue);
	// 		}
	// 		var songId = resData.song_id;
	// 		//var insertUserInfo = "INSERT INTO user_telemetry (device_id, song_id,is_song_liked,latitude,longitude,app_version,locale,platform,radio_station_id,is_liked,user_id,user_type,gender,os_version,country,city,zipcode) VALUES ?";
	// 		var insertUserInfo = "INSERT INTO user_telemetry (user_id,device_id,song_id,is_song_liked,user_type,gender,platform,app_version,os_version,latitude,longitude,radio_station_id,timestamp,country,city,zipcode) VALUES ?";
	// 		var userValue = [[req.body.user_id,deviceId, songId,isLiked, req.body.user_type, req.body.gender, req.body.platform, req.body.app_version, req.body.os_version, req.body.latitude, req.body.longitude, req.body.radio_station_id, req.body.timestamp, req.body.country, req.body.city, req.body.zipcode]];
	// 		console.log(isLiked);
	// 		connection.query(insertUserInfo, [userValue], function (err, result) {
	// 			if (err) {
	// 				res.send(JSON.stringify({ "status": 500, "error": err, "response": null, "success": false }));
	// 			}else{
	// 				console.log(messageValue);
	// 				res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
	// 			}
	// 		});



	// 	}
	// });
});

/* POST songs listing. */
router.post('/allSongs', function (req, res, next) {
	var songQuery = `SELECT * from scheduled_airtraffic where airdate= '` + req.body.airdate + `' and type='101'`;

	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);

		onestation.query(songQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": results, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": results, "success": true }));
				//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});



/* POST songs listing. */
router.post('/likedSongs', function (req, res, next) {
	//var songQuery = `SELECT * from scheduled_airtraffic where airdate= '` + req.body.airdate + `' and type='101'`;
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var airdate = req.body.airdate;
	if (req.body.user_id != null && req.body.user_id != 0) {
		var songQuery = `select scheduled_airtraffic.*,case when song_status=1 then 'true' else 'false' end
		 as is_song_liked ,case when song_status=2 then 'true' else 'false' end as is_song_disliked 
		 from  scheduled_airtraffic inner join (SELECT * FROM user_songs where user_id= ` + userId + ` 
		 and (song_status=1 or song_status=2)) allsongs on (scheduled_airtraffic.program_id = allsongs.song_id or scheduled_airtraffic.program_name= allsongs.song_name)
         where type='101' and airdate='`+ airdate + `'`;
	} else {
		var songQuery = `select scheduled_airtraffic.*,case when song_status=1 then 'true' else 'false' end
		as is_song_liked ,case when song_status=2 then 'true' else 'false' end as is_song_disliked 
		from  scheduled_airtraffic inner join (SELECT * FROM user_songs where device_id= '` + deviceId + `' 
		and (song_status=1 or song_status=2)) allsongs on (scheduled_airtraffic.program_id = allsongs.song_id or scheduled_airtraffic.program_name= allsongs.song_name)
		where type='101' and airdate='`+ airdate + `'`;
	}
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);

		onestation.query(songQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": results, "success": false }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": results, "success": true }));
				//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});
	}else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});





module.exports = router;
var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');



/* POST like song */
router.post('/', function (req, res, next) {

	var isSongLiked = req.body.is_song_liked;
	var isSongDisLiked = req.body.is_song_disliked;
	var deviceId = req.body.device_id;
	var songStatus;
	var teleCode;
	var format = '%d-%m-%Y';
	var songId = req.body.song_id;
	console.log(songId);

	var messageValue = "";

	if (isSongLiked === "true") {
		isSongLiked = "true";
		messageValue = "You liked this song";
		//console.log(messageValue);
		songStatus = 1;
		teleCode = 5;
	} else if (isSongDisLiked === "true") {
		messageValue = "You disliked this song";
		isSongDisLiked = "true";
		//console.log(messageValue);
		songStatus = 2;
		teleCode = 16;
	} else {
		messageValue = "You revert your operation on song";
		isSongLiked = "false";
		isSongDisLiked = "false";
		songStatus = 0;
		teleCode = 17;
		//console.log(messageValue);

	}

	if (req.body.user_id != null && req.body.user_id != 0) {
		var isSongExist = `SELECT * FROM user_songs WHERE user_id = ` + req.body.user_id + ` and (song_id='` + songId + `' or song_name='` + req.body.song_name + `')`;
		console.log(isSongExist);
	} else {
		var isSongExist = `SELECT * FROM user_songs WHERE device_id = '` + req.body.device_id + `' and (song_id='` + songId + `' or song_name='` + req.body.song_name + `')`;
		console.log(isSongExist);
	}
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(isSongExist, function (error, queryResult, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				onestation.end();
			} else {
				if (queryResult != 'undefined' && queryResult.length > 0) {
					//console.log("have data");
					if (req.body.user_id) {
						var updateUserInfo = "UPDATE user_songs SET song_status= '" + songStatus + "' WHERE user_id = " + req.body.user_id + " and song_id= '" + songId + "' and id >=0";
						//console.log(updateUserInfo);
					} else {
						var updateUserInfo = "UPDATE user_songs SET song_status= '" + songStatus + "' WHERE device_id = '" + deviceId + "' and song_id= '" + songId + "' and id >=0";
						//console.log(updateUserInfo);
					}
					onestation.query(updateUserInfo, function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
							onestation.end();
						} else {

							res.send(JSON.stringify({ "status": 200, "error": null, "response": { "message :": messageValue }, "success": true }));
							onestation.end();
						}
					});
				} else {
					//console.log(" doesnot have data");
					var insertSongQuery = "INSERT INTO user_songs (user_id,device_id,song_id,song_status,song_name,talent) VALUES ?";
					var songValue = [[req.body.user_id, deviceId, songId, songStatus, req.body.song_name, req.body.talent]];
					//console.log(songValue);
					onestation.query(insertSongQuery, [songValue], function (err, result) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": result, "success": false }));
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
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}

});


/* POST songs listing. */
router.post('/allSongs', function (req, res, next) {
	var songQuery = `SELECT * from scheduled_airtraffic where airdate= '` + req.body.airdate + `' and type='101'`;
	var dbName = req.headers.db_name;
	console.log(songQuery);
	if (dbName != null) {
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

	var dbName = req.headers.db_name;
	if (dbName != null) {
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



module.exports = router;
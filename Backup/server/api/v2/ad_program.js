var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;
	var todayDate = req.body.airdate;
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	// var selectDataQuery=`select  @curRank:= @curRank+1 as rowNumber,hometraffic.*,'false' as is_ad_liked,'false' as
	// is_ad_disliked,'false' as is_song_liked,'false' as is_song_disliked,'false' as is_ad_fav
	// from hometraffic ,(select @curRank:=0) r
	// where date_format(airdate,'%Y-%m-%d')= date_format(	'`+ todayDate + `' ,'%Y-%m-%d')  ORDER BY airdate`;

	var selectDataQuery = `CALL get_home_add_banner( "` + reqAirdate + `" , "` + reqAirtime + `" )`;
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
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
module.exports = router;

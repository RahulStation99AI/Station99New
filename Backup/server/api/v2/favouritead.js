var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET favourite ads. */
router.post('/', function (req, res, next) {
	var reqAirdate = req.body.airdate;
	var reqAirtime = req.body.airtime;
	var userId = req.body.user_id;
	var deviceId = req.body.device_id;

	// if(req.body.user_id==null || req.body.user_id == 0 ){
	// 	var selectDataQuery = `SELECT addtable.id,addtable.name,addtable.program_id,COALESCE(addtable.Phone,'') as phone,COALESCE(addtable.Address1,'')  as address1,
	// 	COALESCE(addtable.airdate,'') as airdate,COALESCE(addtable.airtime,'') as airtime,
	// 	COALESCE(addtable.City,'') as city,COALESCE(addtable.State,'') as state,COALESCE(addtable.Zipcode,'') as zipcode,
	// 	COALESCE(addtable.Website,'') as website,addtable.email,addtable.length,"" as advert_url,"" as advert_type,"true" as is_ad_fav,"" as hour_slot
	// 	FROM (select add1.id,add1.airdate,add1.airtime,ci.Company,add1.name,add1.program_id,ci.Phone,ci.Address1,ci.City,ci.State,ci.Zipcode,ci.Website,add1.email,add1.length
	// 	from advertisement add1 left join customerinfo ci on ci.Company=add1.name) addtable
	// 	WHERE EXISTS (SELECT * FROM user_fav
	// 	WHERE addtable.id = user_fav.advert_id and device_id= '`+ req.body.device_id +`' and user_fav.is_ad_liked = 'true')`;
	//     console.log("under device " + selectDataQuery);
	// }else {
	// 	var selectDataQuery = `SELECT addtable.id,addtable.name,addtable.program_id,COALESCE(addtable.Phone,'') as phone,COALESCE(addtable.Address1,'')  as address1,
	// 	COALESCE(addtable.airdate,'') as airdate,COALESCE(addtable.airtime,'') as airtime,
	// 	COALESCE(addtable.City,'') as city,COALESCE(addtable.State,'') as state,COALESCE(addtable.Zipcode,'') as zipcode,
	// 	COALESCE(addtable.Website,'') as website,addtable.email,addtable.length,"" as advert_url,"" as advert_type,"true" as is_ad_fav,"" as hour_slot
	// 	FROM (select add1.id,add1.airdate,add1.airtime,ci.Company,add1.name,add1.program_id,ci.Phone,ci.Address1,ci.City,ci.State,ci.Zipcode,ci.Website,add1.email,add1.length
	// 	from advertisement add1 left join customerinfo ci on ci.Company=add1.name) addtable
	// 	WHERE EXISTS (SELECT * FROM user_fav
	// 	WHERE addtable.id = user_fav.advert_id and user_id= `+ req.body.user_id+` and user_fav.is_ad_liked = 'true')`;
	//    console.log("under user " +selectDataQuery);
	// }
	var selectDataQuery =`CALL proc_get_favourite_add(`+userId+`, "`+reqAirdate+`" , "`+reqAirtime+`" , "`+deviceId+`" )`;
	//console.log(selectDataQuery);
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
				var resData =  results[0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true  }));
				}else{
					res.send(JSON.stringify({ "status": 200, "error": error, "response": resData, "success": true  }));
				}
				//If there is no error, all is good and response is 200OK.
				onestation.end();
			}
		});
	}
	else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [],"success": false }));
	}

});
module.exports = router;
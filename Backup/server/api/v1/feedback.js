var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* GET advertisement and program data. */
router.post('/', function (req, res, next) {

	var selectDataQuery = `CALL proc_add_feedback(` + req.body.user_id + `, "` + req.body.device_id + `" , "` + req.body.user_name + `" , "` + req.body.email + `" , "` + req.body.message + `" )`;
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var resData = results[0][0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": error, "response":[], "message":resData.message, "success": true }));
					onestation.end();
				}
				//If there is no error, all is good and response is 200OK.
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [],"message":"Invalid requent sent", "success": false }));
	}
});
module.exports = router;

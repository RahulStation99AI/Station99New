var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* POST user with req body */ 
router.post('/', function (req, res, next) {
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		console.log("station id inside :" + dbName);
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);

		if (req.body.social_id) {
			var social_id = req.body.social_id;
			onestation.query('SELECT * from users where social_id=?', social_id, function (error, results, fields) {
				if (error) {
					res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
					//If there is error, we send the error in the error section with 500 status
				} else {
					res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
					//If there is no error, all is good and response is 200OK.
				}
			});
			onestation.end();
		} else {
			var device_id = req.body.device_id;
			onestation.query('SELECT * from users where device_id=?', device_id, function (error, results, fields) {
				if (error) {
					res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
					//If there is error, we send the error in the error section with 500 status
				} else {
					res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
					//If there is no error, all is good and response is 200OK.
				}
			});
			onestation.end();
		}

	}
});


module.exports = router;

var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST user with req body */
router.post('/', function (req, res, next) {
	if (req.body.social_id) {
		var social_id = req.body.social_id;
		var dbName = req.headers.db_name;
		if (dbName != null) {
			var helper = new GlobalDBHelper(dbName);
			var onestation = helper.getConnection(dbName);
			onestation.query('SELECT * from users where social_id=?', social_id, function (error, results, fields) {
				if (error) {
					res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
					//If there is error, we send the error in the error section with 500 status
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
					//If there is no error, all is good and response is 200OK.
					onestation.end();

				}
			});
		} else {
			res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
		}
	} else {

		var device_id = req.body.device_id;
		var dbName = req.headers.db_name;
		if (dbName != null) {
			var helper = new GlobalDBHelper(dbName);
			var onestation = helper.getConnection(dbName);
			onestation.query('SELECT * from users where device_id=?', device_id, function (error, results, fields) {
				if (error) {
					res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
					//If there is error, we send the error in the error section with 500 status
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
					//If there is no error, all is good and response is 200OK.
					onestation.end();
				}
			});
		} else {
			res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
		}

	}
});


/* Get User Details by User Id */
router.get('/userDetails', function (req, res, next) {
	
		var userId = req.query.user_id;
		var dbName = req.headers.db_name;
		if (dbName != null) {
			var helper = new GlobalDBHelper(dbName);
			var onestation = helper.getConnection(dbName);
			var selectUserQuery = "SELECT * from users where user_id = '"+userId+"'";
			onestation.query(selectUserQuery, function (error, results, fields) {
				if (error) {
					res.send(JSON.stringify({ "status": 500, "error": error, "response": null,"success": false  }));
					//If there is error, we send the error in the error section with 500 status
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": null, "response": results[0],"success": true }));
					//If there is no error, all is good and response is 200OK.
					onestation.end();
				}
			});
		} else {
			res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
		}
	
});

module.exports = router;

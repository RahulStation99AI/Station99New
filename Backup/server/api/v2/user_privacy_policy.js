var express = require('express');
var router = express.Router();
var path = require('path');
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

// Post Terms & conditions
router.post('/', function (req, res) {
	var userId = req.body.user_id;
	//var device_id = req.body.user_id;
	//if (userId != null && userId != 0) {
	var dbName ='kxa';
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query('SELECT pp_status from users where user_id=?', userId, function (error, results, fields) {
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

});

// Accept Terms & conditions
router.post('/acceptPrivacyPolicy', function (req, res) {
	var userId = req.body.user_id;

	//var device_id = req.body.user_id;
	//if (userId != null && userId != 0) {
	var lastUpdatedFileQuery = `UPDATE users SET  pp_status = '1' where user_id=?`;
	var dbName = 'kxa';
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(lastUpdatedFileQuery, [userId], function (error, results, fields) {
			//console.log(lastUpdatedFileQuery);
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				//res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
				var resultData = [];

				resultData.push({
					'success': "true"
				});
				if (results.affectedRows > 0) {
					resultData['data'] = 'true';
					res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData }));
				}
				else {
					resultData.push({
						'success': "true"
					});
					res.send(JSON.stringify({ "status": 200, "error": null, "response": resultData }));
				}
				//If there is no error, all is good and response is 200OK.
				onestation.end();

			}
		});
	}

});

module.exports = router;
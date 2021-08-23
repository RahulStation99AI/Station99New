var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* post Search Data listing. */
router.post('/', function (req, res, next) {
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		
		var searchQuery = `CALL pro_get_cutomer_allias_table_data()`;
		onestation.query(searchQuery, function (error, results, fields) {
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

module.exports = router;
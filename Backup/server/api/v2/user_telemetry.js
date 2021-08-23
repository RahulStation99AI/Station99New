var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
    var insertQuery='insert into user_telemetry set ?';
	//var dbName = req.headers.db_name;
	var dbName = "kxa";
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(insertQuery,req.body, function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": req.body, "message :": "data saved", "success": true }));
				onestation.end();
			}
		});
	}

});
module.exports = router;

var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var ratingQuery = "INSERT INTO rating (user_id,device_id,rating) VALUES ?";
	var ratingValue = [[req.body.user_id, req.body.device_id, req.body.rating]];
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(ratingQuery, [ratingValue], function (err, result) {
			if (err) {
				res.send(JSON.stringify({ "status": 500, "error": err, "response": [], "success": false }));
				onestation.end();
			} else {
				res.send(JSON.stringify({ "status": 200, "error": null, "response": [], "message :": "data saved", "success": true }));
				onestation.end();
			}
		});
	}else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});
module.exports = router;

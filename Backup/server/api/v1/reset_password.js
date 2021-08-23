var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

router.post('/', function (req, res, next) {
    var userId = req.body.user_id;
    var userPassword = req.body.user_password;
	var dbName = req.headers.db_name;
	var helper = new GlobalDBHelper(dbName);
	var onestation = helper.getConnection(dbName);
	var resetPasswordQuery = `CALL proc_reset_password( "` + userId + `","` + userPassword + `")`;
	onestation.query(resetPasswordQuery, function (error, results, fields) {
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "success": false }));
			onestation.end();
		} else {
            var resData = results[0][0];
            console.log(resData.is_exist);
			if (resData.is_exist === "false") {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message": resData.message, "success": false }));
			} else {
				res.send(JSON.stringify({ "status": 200, "error": error, "response":[], "message": resData.message,"success": true }));
			}
			onestation.end();
		}
	});
});

module.exports = router;
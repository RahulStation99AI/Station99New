var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

/* GET special advertisement listing. */
router.post('/', function (req, res, next) {

	var userId = req.body.user_id;
	var existingPassword = req.body.existing_password;
	var newPassword = req.body.new_password;
	var dbName = req.headers.db_name;
	var helper = new GlobalDBHelper(dbName);
	var onestation = helper.getConnection(dbName);
	var specialQuery = `CALL proc_change_password( "` + userId + `" , "` + existingPassword + `", "` + newPassword + `" )`;
	onestation.query(specialQuery, function (error, results, fields) {
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "success": false }));
			//If there is error, we send the error in the error section with 500 status
			onestation.end();
		} else {
            var resData = results[0];
            
			if (resData[0].is_exist === "false") {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message": "Your previous password incorrect!", "success": false }));
			} else {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message": "Password change successfully!", "success": true }));
			}
			//If there is no error, all is good and response is 200OK
			onestation.end();
		}
	});
});

module.exports = router;

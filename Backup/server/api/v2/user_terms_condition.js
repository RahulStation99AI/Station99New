var express = require('express');
var router = express.Router();
var path = require('path');
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


// Post Terms & conditions
router.post('/', function (req, res) {
	var userId = req.body.user_id;
	console.log('sss');
	//var device_id = req.body.user_id;
	//if (userId != null && userId != 0) {
	var dbName = 'kxa';
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query('SELECT tc_status from users where user_id=?', userId, function (error, results, fields) {
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

// Post Terms & conditions
// router.post('/userTermsAndConditionCheck',function(req,res){
//     var userId = req.body.user_id;
//     console.log(userId);
//     console.log('vikash');
//     //var device_id = req.body.user_id;
//     //if (userId != null && userId != 0) {
// 	    connection.query('SELECT tc_status as status from users where user_id=?',userId, function (error, results, fields) {
// 	  	if(error){
// 	  		res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
// 	  		//If there is error, we send the error in the error section with 500 status
// 	  	} else {
//   			res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
//   			//If there is no error, all is good and response is 200OK.
// 	  	}
//       });

// });


// Accept Terms & conditions
router.post('/acceptTermsCondition', function (req, res) {
	var userId = req.body.user_id;

	//var device_id = req.body.user_id;
	//if (userId != null && userId != 0) {
	var lastUpdatedFileQuery = `UPDATE users SET  tc_status = '1' where ?=`;
	var dbName = 'kxa';
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(lastUpdatedFileQuery, userId, function (error, results, fields) {
			console.log(lastUpdatedFileQuery);
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

module.exports = router;
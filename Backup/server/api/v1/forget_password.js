var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
/* GET special advertisement listing. */
router.post('/', function (req, res, next) {

	var userEmail = req.body.user_email;

	var password = generator.generate({
		length: 10,
		numbers: true
	});
	 
	// 'uEyMTw32v9'
	console.log(password);

	var dbName = req.headers.db_name;
	var helper = new GlobalDBHelper(dbName);
	var onestation = helper.getConnection(dbName);
	var forgetPasswordQuery = `CALL proc_forgot_password( "` + userEmail + `","` + password + `")`;
	onestation.query(forgetPasswordQuery, function (error, results, fields) {
		if (error) {
			res.send(JSON.stringify({ "status": 500, "error": error, "response": [], "success": false }));
			//If there is error, we send the error in the error section with 500 status
			onestation.end();
		} else {
            var resData = results[0][0];
            console.log(resData.is_exist);
			if (resData.is_exist === "false") {
				res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message": resData.message, "success": false }));
			} else {
				asyncCall('Your Temporary Password','<p>Hi Dear,<br/> Your Temporary Password for your login is <b>'+password+'</b> Please login and reset your password because it will be de-activated after 24 Hours.</p>');
				res.send(JSON.stringify({ "status": 200, "error": error, "response":[], "message": resData.message,"success": true }));
			}
			//If there is no error, all is good and response is 200OK
			onestation.end();
		}
	});
});


var functionSendMail = function(title,msg){
		
    return new Promise(resolve => {
        let transport = nodemailer.createTransport({
            host: 'station99ai.com',
			port: 465,
			auth: {
				user: 'support@station99ai.com',
				pass: 'Station99@Support@I'
			}
        });

        const message = {
            from: 'support@station99ai.com', // Sender address
            to: 'manishgupta1890@gmail.com',         // List of recipients
            subject: title, // Subject line
            html: '<p>'+msg+'</p>' // Plain text body
        };

        transport.sendMail(message, function(err, info) {
            if (err) {
                console.log(err);
                resolve('Error while sending mail');
            } else {
                console.log(info);
                resolve('Success Mail has been send');
            }
        });
    });
}

async function asyncCall(title,msg) {
    var result = await functionSendMail(title,msg);
    console.log(result);
}

module.exports = router;

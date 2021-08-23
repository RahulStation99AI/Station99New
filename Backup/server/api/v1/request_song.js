var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

var functionSendMail = function (customerName,songName,albumName,artistName,messageName,userName) {

	return new Promise(resolve => {
		let transport = nodemailer.createTransport({
			host: 'station99ai.com',
				port: 465,
				auth: {
				user: 'support@station99ai.com',
				pass: 'Station99@Support@I'
			}
			
        });
        
        var htmlBody = '<table style="font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;  border-collapse: collapse;  width: 100%;">';
       //console.log();
       htmlBody += '<tr> <th style="padding: 12px;  text-align: left;  background-color: #FF3276;  color: white;"> Song Name </th> <th style="padding: 12px;  text-align: left;  background-color: #FF3276;  color: white;"> Album Name </th> <th style="padding: 12px;  text-align: left;  background-color: #FF3276;  color: white;"> Artist </th> <th style="padding: 12px;  text-align: left;  background-color: #FF3276;  color: white;"> Message </th> <th style="padding: 12px;  text-align: left;  background-color: #FF3276;  color: white;"> User Name </th></tr>';
        

				if(songName == "test" || songName == "text" || albumName == "test" || albumName == "text" || artistName == "test" || artistName == "text" || messageName == "test" || messageName == "text"){

				}else{
					
						htmlBody += '<tr style="background-color: #f2f2f2;text-align:center;"> <td style="border: 1px solid #ddd;  padding: 8px;"> '+songName+' </td> <td style="border: 1px solid #ddd;  padding: 8px;"> '+albumName+' </td> <td style="border: 1px solid #ddd;  padding: 8px;"> '+artistName+' </td> <td style="border: 1px solid #ddd;  padding: 8px;"> '+messageName+' </td> <td style="border: 1px solid #ddd;  padding: 8px;"> '+userName+' </td> </tr>';
					
				}
        
		htmlBody += '</table>';

		var email_to = 'connect@connectfm.ca';
		//var email_to = 'vikash@nssplindia.com';
		var email_cc = 'rahul.station99@gmail.com,sudhir.station99@gmail.com';
		
		

		const message = {
			from: customerName+' Song Suggestions'+' <support@station99ai.com>', // Sender address
			to: email_to,         // List of recipients
			subject: 'Song Suggestions for '+customerName, // Subject line
			cc: email_cc,
			html: htmlBody
		};

		transport.sendMail(message, function (err, info) {
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

async function asyncCall(customerName,songName,albumName,artistName,message,userName) {
	await functionSendMail(customerName,songName,albumName,artistName,message,userName);
}



/* GET advertisement and program data. */
router.post('/', function (req, res, next) {
	var selectDataQuery = `CALL proc_add_request_song(` + req.body.user_id + `, "` + req.body.device_id + `" , "` + req.body.song + `" , "` + req.body.album + `" , "` + req.body.artist + `" , "` + req.body.message + `" )`;
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {

				var resData = results[0][0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "success": true }));
					onestation.end();
				} else {
					if(dbName == "connect_fm"){
						asyncCall('Connect FM',req.body.song,req.body.album ,req.body.artist,req.body.message,resData.user_name);
					}
					res.send(JSON.stringify({ "status": 200, "error": error, "response":[],"message":resData.message, "success": true }));
					onestation.end();
				}
				//If there is no error, all is good and response is 200OK.
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [],"message":"Invalid requent sent", "success": false }));
	}
});
module.exports = router;

var express = require('express');
var router = express.Router();
const fs = require("fs");
var nodemailer = require('nodemailer');
const fastcsv = require("fast-csv");
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


var mailSendStatus = false;
/* POST api to save search telemetry*/
router.get('/',async function (req, res, next) {

    var dbName = req.headers.db_name;

    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var currDate = formatDate();
        currDate = '2020-05-27';
        var selectQuery = "select c.id,c.name,c.description,c.account_id,ci.company_email from contest c inner join contest_rule cr on cr.id = c.rule_id inner join customer_info ci on ci.﻿id = c.account_id where ('2020-05-18' >= date(c.start_date) AND '2020-05-18' <= date(c.end_date))";
        onestation.query(selectQuery,async function (err, result) {
            if (err) {
                onestation.end();
            } else {
                //console.log(result);
                for (const fileItem of result) {
                    mailSendStatus = false;
                    var contestId = fileItem.id;
                    var contestName = fileItem.name;
                    var contestDescription = fileItem.description;
                    var companyEmail = fileItem.company_email;
                    await getContestParticipant(currDate,contestId,contestName,contestDescription,companyEmail,dbName);
                }
                res.send(JSON.stringify({ "status": 200, "error": null, "response":result,"message :": "data saved", "success": true }));
                onestation.end();
            }
        });

    }
});

async function getContestParticipant(currDate,contestId,contestName,contestDescription,companyEmail,dbName){

    await new Promise((resolve) => {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName); 

        var selectQuery = "select u.user_name,u.email_id,u.phone,c.name,ucd.contest_play_date from user_contest_details ucd inner join users u on u.user_id = ucd.user_id inner join contest c on c.id = ucd.contest_id where ucd.contest_id = '"+contestId+"' and date(ucd.contest_play_date) = '"+currDate+"'";
        onestation.query(selectQuery,async function (err, resultPlaylistItem) {
            if (err) {
                onestation.end();
            } else {

                if(resultPlaylistItem.length > 0){
                    console.log('participant available');
                    const jsonData = JSON.parse(JSON.stringify(resultPlaylistItem));
                    const ws = fs.createWriteStream("contest_winner_select.csv");
                    fastcsv
                    .write(jsonData, { headers: true })
                    .on("finish", async function() {
                        await functionSendMail(contestName,'manishgupta1890@gmail.com',jsonData,contestDescription,companyEmail);

                       // console.log('mailSendStatus : '+mailSendStatus);

                        if(mailSendStatus){
                            resolve(console.log("get Youtube playlist"));
                            onestation.end();
                        }
                    })
                    .pipe(ws);
                }else{
                    console.log('No participant');
                    resolve(console.log("get Youtube playlist"));
                }
            }
        });
    });
}


var functionSendMail = async function (customerName,email_address,jsonData,contestDescription,companyEmail) {

	return new Promise(resolve => {
		let transport = nodemailer.createTransport({
			host: 'station99ai.com',
				port: 465,
				auth: {
				user: 'support@station99ai.com',
				pass: 'Station99@Support@I'
			}
			
        });
        
        //var htmlMessage= '<p>Hi, <br/> List of all participant. for contest '+customerName+'</p>';
        
        var htmlMessage = '<table border="1" cellpadding="0" cellspacing="0" width="100%">';
        htmlMessage = htmlMessage + '<tr><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">Name</th><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">Email Id</th><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">Phone Number</th><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">Contest Name</th><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">Contest Play Date</th><th style="border: 1px solid #ddd;padding: 8px;padding-top: 12px;padding-bottom: 12px;text-align: left;background-color: #FB85A9;color: white;">contest Description</th></tr>';
        var oddEvenCounter = 1;
        for (const fileItem of jsonData) {
            var user_name = fileItem.user_name;
            var email_id = fileItem.email_id;
            var contestName = fileItem.name;
            var phone = fileItem.phone;
            var contest_play_date = fileItem.contest_play_date;

            if(oddEvenCounter % 2 == 0) {
                htmlMessage = htmlMessage + '<tr style="background-color: #f2f2f2;"><td style="border: 1px solid #ddd;padding: 8px;">'+user_name+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+email_id+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+phone+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contestName+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contest_play_date+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contestDescription+'</td></tr>';
             } else {
                htmlMessage = htmlMessage + '<tr><td style="border: 1px solid #ddd;padding: 8px;">'+user_name+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+email_id+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+phone+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contestName+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contest_play_date+'</td><td style="border: 1px solid #ddd;padding: 8px;">'+contestDescription+'</td></tr>';
             }
             oddEvenCounter++;
        }

        htmlMessage = htmlMessage + '</table>';
		const message = {
			from: ' Contest Participant for '+customerName+' <support@station99ai.com>', // Sender address
			to: email_address,         // List of recipients
			subject: 'Contest Participant of '+customerName, // Subject line
			cc: 'vikash@nssplindia.com',
			html: htmlMessage,
			attachments: [
				{ // Use a URL as an attachment
					  filename: 'Contest List For '+customerName+'.csv',
					  path: 'contest_winner_select.csv'
				}
			]
		};

		transport.sendMail(message, function (err, info) {
			if (err) {
				console.log(err);
				resolve('Error while sending mail');
			} else {
				console.log(info);
                resolve('Success Mail has been send');
                mailSendStatus = true;
			}
		});
	});
}


function formatDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = router;

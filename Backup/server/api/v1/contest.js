var express = require('express');
var router = express.Router();
const fs = require("fs");
var nodemailer = require('nodemailer');
const fastcsv = require("fast-csv");
var { GlobalDBHelper } = require('./GlobalDBHelper.js');
const shortid = require('shortid');
const dbConfig=require("../../dbconfig");

const
     multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('image')
    , azureStorage = require('azure-storage')
    , getStream = require('into-stream')
    , containerName = 'images';

const handleError = (err, res) => {
    res.status(500);
    res.render('error', { error: err });
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${originalName}`;
};

function saveImg(rawdata, F_name) {
//	console.log(F_name);
    var buffer = Buffer.from(rawdata, 'base64');
    const
          blobName = getBlobName(F_name)
        , stream = getStream(buffer)
        , streamLength = buffer.length
    ;
//    console.log(F_name);
    const blobService = azureStorage.createBlobService(dbConfig.container,dbConfig.key);
    
    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

        if(err) {
            handleError(err);
            return;
        }
        console.log('success','File uploaded to Azure Blob storage.');
    
    });

}


router.post('/generateNewContest',uploadStrategy ,function (req, res, next) {
  //  console.log(req.body);
	var contestTitle = req.body.contestTitle;
	var contestDescription = req.body.contestDescription;
    var bannerName = req.body.bannerName;
	var termsContent = req.body.termsContent;
	var ruleId = req.body.ruleId;
	var startDate = req.body.startDate;
	var endDate = req.body.endDate;
	var accountId = req.body.accountId;
	var contestResultUrl = req.body.contestResultUrl;
	var contestXDays = req.body.contestXDays;
	var contestTermsUrl = req.body.contestTermsUrl;
	 
	var filename = "";
	if (req.body.bannerName != '') {
		filename = 'contest_' + shortid.generate();
	//	console.log(filename);
		saveImg(bannerName, filename);
	}

	var addConntestQuery = `CALL proc_generate_contest("` + contestTitle + `","` + contestDescription +`", "` + filename + `", "`+contestTermsUrl+`", "` + ruleId + `", "` + startDate + `", "` + endDate + `", "` + accountId + `","`+contestResultUrl+`","`+contestXDays+`","`+ termsContent +`")`;
	var dbName = req.headers.db_name;
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(addConntestQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var resData = results[0][0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":"contest revert null", "success": true }));
					onestation.end();
				} else {
					if(resData.status){
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":resData.message, "success": true }));
					}else{
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message":resData.message, "success": false }));
					}
					
					onestation.end();
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});


/* Get Contest List. */
router.post('/contestList', function (req, res, next) {
	var userId = req.body.user_id;
	var requested_date = req.body.requested_date;
    var requested_time = req.body.requested_time;
    var dbName = req.headers.db_name;
	var selectDataQuery = `CALL proc_get_contest(` + userId + `, "` + requested_date + `" , "` + requested_time + `","`+ dbName +`")`;
	
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				//If there is error, we send the error in the error section with 500 status
				onestation.end();
			} else {
				var resData = results[0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": {'contest_details':[]}, "success": true }));
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": {'contest_details':resData}, "success": true }));
					onestation.end();
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});



/* Add contest for User Play. */
router.post('/addContest', function (req, res, next) {
    console.log(req.body);
    var user_id = req.body.user_id;
    var contest_id = req.body.contest_id;
	var requested_date = req.body.requested_date;
	var requested_time = req.body.requested_time;
	var selectDataQuery = `CALL proc_add_user_contest(` + user_id + `, "` + contest_id + `", "`+requested_date+`", "` + requested_time + `")`;
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
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":"contest revert null", "success": true }));
					onestation.end();
				} else {
					if(resData.status){
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":resData.message, "success": true }));
					}else{
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message":resData.message, "success": true }));
					}
					
					onestation.end();
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});


/* Add contest for User Play. */
router.get('/addContestPopupForm', function (req, res, next) {
    console.log(req.body);
    var user_id = req.query.user_id;
    var contest_id = req.query.contest_id;
	var user_name = req.query.user_name;
	var user_phone = req.query.user_phone;
	var user_answer = req.query.user_answer;
	var selectDataQuery = `CALL proc_add_user_contest_popup_form(` + user_id + `, "` + contest_id + `", "` + user_name + `", "` + user_phone + `", "` + user_answer + `")`;
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
					res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":"contest revert null", "success": true }));
					onestation.end();
				} else {
					if(resData.status){
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [], "message":resData.message, "success": true }));
					}else{
						res.send(JSON.stringify({ "status": 200, "error": error, "response": [],"message":resData.message, "success": true }));
					}
					
					onestation.end();
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});


router.get('/getContestTermsAndCondition', function (req, res, next) {

    var dbName = req.headers.db_name;
    var tcId = req.query.tcId;

    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "SELECT terms_content FROM contest where id='"+tcId+"'";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {            
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Data Fetch Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    } 
});



router.get('/getContestResult', function (req, res, next) {

    var dbName = req.headers.db_name;
	var tcId = req.query.tcId;
	var userId = req.query.userId;

    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		if(userId == "0"){
			var selectPrivacy = "select id,user_id,(SELECT user_name FROM users where user_id = contest_winner.user_id ) as name from contest_winner where contest_id = '"+tcId+"'";
			
		}else{
			var selectPrivacy = "select id,user_id,(SELECT user_name FROM users where user_id = contest_winner.user_id ) as name from contest_winner where user_id = '"+userId+"' and contest_id = '"+tcId+"'";
		}
        
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {            
				console.log(result);

				if(result.length > 0){
					res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Result declaired!", "success": true }));
					onestation.end();
				}else{
					res.send(JSON.stringify({ "status": 200, "error": null, "response": result,"message":"Result Not Declaired yet!", "success": false }));
                	onestation.end();
				}
                
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    } 
});


router.post('/generateWinner', function (req, res, next) {

    var dbName = req.headers.db_name;
	var contestId = req.body.contest_id;

    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectAllContest = "select * from user_contest_details where contest_id = '"+contestId+"'";
   
        onestation.query(selectAllContest, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {    
				
				var contestUser = result.length;
				var winnnerIndex = Math.floor(Math.random() * contestUser);
				var userId = result[winnnerIndex]['user_id'];
				
				if(userId != ""){

					// var selectRecordExist = "select count(*) as record_exist from contest_winner where user_id = '"+userId+"' and contest_id = '"+contestId+"'";
					var selectRecordExist = "select count(*) as record_exist from contest_winner where contest_id = '"+contestId+"'";
					onestation.query(selectRecordExist, function (err, resultexist) {
						if (err) {
							res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
							onestation.end();
						} else {         
							 
							if(resultexist[0]['record_exist'] == 0){
								
								var addQuerys = `CALL proc_add_winner(` + userId + `, "` + contestId + `")`;
		
								onestation.query(addQuerys, function (err, resultAdd) {
									
									if (err) {
										res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
										onestation.end();
									} else {            
										
										var resData = resultAdd[0][0];
										if(resData.status == "true"){
											res.send(JSON.stringify({ "status": 200, "error": null, "response": resData,"message":resData.message, "success": true }));
											onestation.end();
										}else{
											if(resData.previous_win == "true"){
												// var winnnerIndex = generateRandonNumber(contestUser,result); 
												
												var winnnerIndex = Math.floor(Math.random() * contestUser);
												var userIda = result[winnnerIndex]['user_id'];
								
												var addQuerys = `CALL proc_add_winner(` + userId + `, "` + contestId + `")`;
		
												onestation.query(addQuerys, function (err, resultAdd) {
													
													if (err) {
														res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
														onestation.end();
													} else {            
														
														var resData = resultAdd[0][0];
														if(resData.status == "true"){
															res.send(JSON.stringify({ "status": 200, "error": null, "response": resData,"message":resData.message, "success": true }));
															onestation.end();
														}else{
															if(resData.previous_win == "true"){
																// var winnnerIndex = generateRandonNumber(contestUser,result); 
																
																var winnnerIndex = Math.floor(Math.random() * contestUser);
																var userIda = result[winnnerIndex]['user_id'];
																// Again loop for recustion
																res.send(JSON.stringify({ "status": 200, "error": null, "response": resData,"message":resData.message, "success": false }));
																onestation.end();
															}else{
																res.send(JSON.stringify({ "status": 200, "error": null, "response": resData,"message":resData.message, "success": false }));
																onestation.end();
															}
															
														}
													}
												});
												
											}else{
												res.send(JSON.stringify({ "status": 200, "error": null, "response": resData,"message":resData.message, "success": false }));
												onestation.end();
											}
											
										}
									}
								});

							}else{
								res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"Winner has already declaired!", "success": false }));
								onestation.end();
							}
						}
					});

				}else{
					res.send(JSON.stringify({ "status": 200, "error": null, "response": [],"message":"issue while finding index!", "success": false }));
					onestation.end();
				}
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    }  
});



// function generateRandonNumber(contestUser,userDetails) {
// 	console.log(JSON.stringify(userDetails));
// 	var rowData = JSON.stringify(userDetails);
// 	var winnnerIndexNew = Math.floor(Math.random() * contestUser);
// 	console.log(rowData);
// 	return winnnerIndexNew;
// }


router.post('/getAllContestParticipator', function (req, res, next) {

	var dbName = req.headers.db_name;
	var contestId = req.body.contest_id;
    var email_address = req.body.email_address;

    if (dbName != null) {
       
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        var selectPrivacy = "select u.user_name,u.email_id,u.phone,c.name,ucd.contest_play_date from user_contest_details ucd inner join users u on u.user_id = ucd.user_id inner join contest c on c.id = ucd.contest_id where ucd.contest_id = '"+contestId+"'";
   
        onestation.query(selectPrivacy, function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response": [],"message":"Issue while Getting Record!", "success": false }));
                onestation.end();
            } else {            
				const jsonData = JSON.parse(JSON.stringify(result));
			console.log("jsonData", jsonData);
			var customerName = result[0]['name'];
			const ws = fs.createWriteStream("contest_winner_select.csv");
			fastcsv
			.write(jsonData, { headers: true })
			.on("finish", function() {
			  asyncCall(customerName,email_address);
			})
			.pipe(ws);
			
                res.send(JSON.stringify({ "status": 200, "error": null, "response": result[0],"message":"Data Fetch Successfull!", "success": true }));
                onestation.end();
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "response": "Invalid requent sent", "success": false }));
    } 
});


var functionSendMail = function (customerName,email_address) {

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
			from: ' Contest Participant'+' <support@station99ai.com>', // Sender address
			to: email_address,         // List of recipients
			subject: 'Contest Participant of '+customerName, // Subject line
			cc: 'manishgupta1890@gmail.com',
			html: '<p>Hi, <br/> List of all participant. for '+customerName+'</p>',
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
			}
		});
	});
}

async function asyncCall(customerName,email_address) {
	await functionSendMail(customerName,email_address);
}



/* Get Contest List. */
router.post('/contest', function (req, res, next) {
	
	var accountId = req.body.accountId;
	var contestType = req.body.contestType;

	console.log(contestType);
	

    var dbName = req.headers.db_name;
	var selectDataQuery = `CALL proc_get_specific_contest(` + accountId + `, "` + contestType + `")`;
	
	if (dbName != null) {
		var helper = new GlobalDBHelper(dbName);
		var onestation = helper.getConnection(dbName);
		onestation.query(selectDataQuery, function (error, results, fields) {
			if (error) {
				res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
				onestation.end();
			} else {
				var resData = results[0];
				if (typeof resData === "undefined") {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": {'contest_details':[]}, "success": true }));
					onestation.end();
				} else {
					res.send(JSON.stringify({ "status": 200, "error": error, "response": {'contest_details':resData}, "success": true }));
					onestation.end();
				}
			}
		});
	} else {
		res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
	}
});


module.exports = router;
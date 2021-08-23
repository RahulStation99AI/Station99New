var express = require('express');
var mysql = require('mysql');
var dbConfig=require('../../dbconfig');
var nodemailer = require('nodemailer');
var router = express.Router();

var lastUpdatedData, scheduleTrafficFile;
var insertSchTrafficValues = [];



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
            subject: title+' Production vikash schedule airtrafic', // Subject line
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

var maxTry = 1;
function retry(stationName,dbName,scheduledTrafficFTPPath){
    if(maxTry<=5){
        maxTry++;  
        setTimeout(function () {
            scheduleData(stationName,dbName,scheduledTrafficFTPPath);
        }, maxTry*60000);      
    }
    else
        maxTry=1;
}

const scheduleData = async (stationName,dbName,scheduledTrafficFTPPath) => {
    var Client = require('ftp');
    var c = new Client();
   // var scheduledTrafficFTPPath = '/Krko/Music/';
    var connTimeout = 60000;
	var pasvTimeout = 60000;

    c.connect({
        host: 'ftp.station99ai.com',
        port: '21',
        user: 'kxa@station99ai.com',
        password: 'Kxa@321',        
        connTimeout: connTimeout,
        pasvTimeout: pasvTimeout
    });


    c.on('ready', function () {
        c.list(scheduledTrafficFTPPath, false, (error, fileslist) => {
            var fileScheduleArray = [];
            fileslist.map((item) => {
                if (item.type !== 'd') {
                    var fileName = item.name;
                    if (fileName.endsWith('.ASC_PROCESSED')) {
                        fileScheduleArray.push(item.name);
                    }
                }
            })

            var dbConnection = mysql.createConnection({
                host: dbConfig.hostname,
                user: dbConfig.username,
                password: dbConfig.password,
                database: dbName,
                port: 3306
            });
            dbConnection.connect();
            dbConnection.query('SELECT scheduled_airtraffic FROM last_updated_traffic', async function (err, result) {
                if (err) {
                    dbConnection.end();
                } else {
                   
                    lastUpdatedData = result[0];
                    console.log(lastUpdatedData);
                    if (typeof lastUpdatedData === "undefined") {
                    
                    } else {
                        scheduleTrafficFile = lastUpdatedData.scheduled_airtraffic;
                        //console.log(fileAdvertArray);
                        for (const file of fileScheduleArray) {
                           
                            var lastSavedDate = scheduleTrafficFile.toString().split('.');
                            var previousSavedDate = file.toString().split('.');
                            
                            if (parseInt(lastSavedDate[0]) < parseInt(previousSavedDate[0])) {
                                  await returnNum(scheduledTrafficFTPPath,file,c,dbName,stationName);
                                 // console.log("async wait end");
                            }
                        }
                        
                        console.log('after forEach');
                        asyncCall('Cronjob Reminder for '+stationName+' scheduled_airtraffic','Data for the '+stationName+' scheduled_airtraffic has been imported');

                        //res.end('<!DOCTYPE html><html><head><title>Render index html file</title></head><body> <div style="text-align:center;color:green;"><p style="font-size:25px;">Data Has Been Imported.</p> </div></body></html>');

                    }

                    dbConnection.end();
                }
            });
        });  
    });

    c.on('error', (err) => {
        asyncCall('Error on '+stationName+' scheduled_airtraffic','FTP Client is not connect for '+stationName+' scheduled_airtraffic'+err);
        retry(stationName,dbName,scheduledTrafficFTPPath);
    });

  }
  
  async function returnNum(scheduledTrafficFTPPath,fileName,c,dbName,stationName){
			  console.log(scheduledTrafficFTPPath+fileName);

			  // Await for the promise to resolve
			  await new Promise((resolve) => {
			  c.get(scheduledTrafficFTPPath + fileName, async function(err, stream) {
					
				//var content = '';
				var array = [];
				if(err !=  'Error: Unable to make data connection'){
					console.log('developer vikash : '+ scheduledTrafficFTPPath + fileName);
					stream.on('data', async function(chunk) {
					   // content += chunk.toString();
						array.push(chunk);
					});
					stream.on('end', async function() {
						// content variable now contains all file content.
								
					var bufferData = Buffer.concat(array).toString();
					var newData = bufferData.split("\n");

					for (const newDataVal of newData) {
					   // console.log(fileName);
					   funScheduleProgram(newDataVal, fileName);
					}

					console.log('bhoopesh');
					

				   var insertInfo = "INSERT INTO scheduled_airtraffic (airdate,airtime,length,program_id,program_name,type,talent) VALUES ?";

				   var dbConnection = mysql.createConnection({
					   host: dbConfig.hostname,
					   user: dbConfig.username,
					   password: dbConfig.password,
					   database: dbName,
					   port: 3306
				   });

				   dbConnection.connect();
				   dbConnection.query(insertInfo, [insertSchTrafficValues],async function (err, result) {
					   if (err) {
						   dbConnection.end();
					   } else {
						   console.log("data inserted");
						   insertSchTrafficValues = [];
						   var correctionQuery = `UPDATE scheduled_airtraffic SET program_name= TRIM(REPLACE(program_name, '"', '')),talent= TRIM(REPLACE(talent, '"', '')) WHERE 1=1`;
						   dbConnection.query(correctionQuery,async function (err, result) {
							   if (err) {
								   dbConnection.end();
								   asyncCall('Error on Krko kxa','scheduled_airtraffic Table is not connect '+err);
							   } else {
								   console.log("data corrected");
								   var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  scheduled_airtraffic = ? where id= '1'`;
								   var lastUpdatedFileValue = [fileName];
								   dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue,async function (err, result) {
									   if (err) {
										   dbConnection.end();
										   asyncCall('Error on '+stationName,'last_updated_traffic Table is not connect for '+stationName+' '+err);
									   } else {
										   console.log("last updated filename : " + fileName);

										   var insertCronQuery = "INSERT INTO cronlog (updated_at,type,filename) VALUES ?";
										   var cronValue = [[new Date(), "krko", fileName]];

										   dbConnection.query(insertCronQuery, [cronValue],async function (err, result) {
											   if (err) {
												   dbConnection.end();
												   asyncCall('Error on '+stationName+' scheduled_airtraffic','cronlog Table is not connect '+err);
											   } else {
												   console.log("data logged");
												   dbConnection.end();
													// Resolve the promise
													resolve(
														//console.log(array)
														console.log('Read Data from FTP')
													);
											   }
										   });


									   }
								   });
							   }
						   });

					   }
				   });
					 // Resolve the promise
					
					});
				}
				
			})
		});
		
		console.log('hi');
        
  }



 async function funScheduleProgram(content, fileName) {
    await new Promise((resolve) => {

        
        var schDate = fileName.split('.');
        var yearValue = schDate[0].toString().substring(0, 2);
        var monthValue = schDate[0].toString().substring(2, 4);
        var dateValueNew = schDate[0].toString().substring(4, 6);
        var dateFormated = "20" + yearValue + "-" + monthValue + "-" + dateValueNew;
        var data = content.split(',');
        var dataValue = [];
        dataValue.push(dateFormated);
        //expected-->airdate,airtime,length,program_id,program_name,type,talent
        // '00:00:00,,LID,DA0132,"Location ID 10,tyy,kkk","Legal ID",00:10, , ,, ';
        for (var i = 0; i < data.length; i++) {
            data[i] = data[i].replace(/^\s*/, "").replace(/\s*$/, "");
            var finalD = Buffer.from(data[i]);
            var count = (data[i].match(/"/g) || []).length;
            var k = i;
            var temp = data[i];
            if (count === 1) {
                var len = 1;
                for (k; k < data.length - 1; k++) {
                    len = len + 1;
                    count = (data[k + 1].match(/"/g) || []).length;
                    if (count === 1) {
                        temp = temp + ',' + data[k + 1];
                        break;
                    } else {
                        temp = temp + ',' + data[k + 1];
                    }
                }
                data[i] = temp;

                for (i + 1; i < data.length - len; i++) {
                    data[i + 1] = data[i + len];
                }
            }
        }

        console.log(data);
        var schDate = fileName.split('.');
        var yearValue = schDate[0].toString().substring(0, 2);
        var monthValue = schDate[0].toString().substring(2, 4);
        var dateValueNew = schDate[0].toString().substring(4, 6);
        var dateFormated = "20" + yearValue + "-" + monthValue + "-" + dateValueNew;

        var receivedAirTime = data[0];
        var hourValue = receivedAirTime.toString().substring(0, 2);
        var minValue = receivedAirTime.toString().substring(3, 5);
        var secValue = receivedAirTime.toString().substring(6, 8);

        if (parseInt(hourValue) > 23 || parseInt(minValue) >= 60 || parseInt(secValue) >= 60) {

        } else {
            var dataValue = [];

            data[5]
            if(typeof data[5] === 'undefined') {

                console.log('vikash');
        
            } else {

                dataValue.push(dateFormated);
                dataValue.push(data[0]);
                dataValue.push(data[6]);
                dataValue.push(data[3]);
                dataValue.push(data[4]);
                dataValue.push(data[2]);
                dataValue.push(data[5]);
                insertSchTrafficValues.push(dataValue);
                console.log("data saved");
                // console.log('vikash kumar kashyap : '+data[0]+' 5 '+data[5]+' '+data[3]);
            }
        }

    });
}


/* POST file copy */
router.get('/', async function (req, res, next) {
    
   await scheduleData('KRKO','station99_new','/Krko/Music/');
   await scheduleData('KKXA','station99_test','/Kkxa/Music/');
});

module.exports = router;
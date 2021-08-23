var express = require('express');
var Client = require('ftp');
var mysql = require('mysql');
var dbConfig=require('../../dbconfig');
var router = express.Router();
var asyncCall = require('./sendMail')
var lastUpdatedData, advertFile;
var insertAdvertValues = [];


var maxTry = 1;
function retry(res,stationName,dbName,advertFTPPath){
    if(maxTry<=5){
        maxTry++;  
        setTimeout(function () {
            advertData(res,stationName,dbName,advertFTPPath);
        }, maxTry*60000);      
    }
    else
        maxTry=1;
}

const advertData = async (res,stationName,dbName,advertFTPPath) => {

    var c = new Client();
   // var advertFTPPath = '/Krko/Traffic/';
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
        c.list(advertFTPPath, false, (error, fileslist) => {
            var fileAdvertArray = [];
            // console.log("vikash kashyap");
            // console.log(fileslist);
            fileslist.map((item) => {
                if (item.type !== 'd') {
                    var fileName = item.name;
                    if (fileName.endsWith('.SKD_PROCESSED')) {
                        fileAdvertArray.push(item.name);
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
            dbConnection.query('SELECT advertisement FROM last_updated_traffic', async function (err, result) {
                if (err) {
                    dbConnection.end();
                } else {
                   
                    lastUpdatedData = result[0];
                    console.log(lastUpdatedData);
                    if (typeof lastUpdatedData === "undefined") {
                    
                    } else {
                        advertFile = lastUpdatedData.advertisement;
                        //console.log(fileAdvertArray);
                        for (const file of fileAdvertArray) {
                           
                            var lastSavedDate = advertFile.toString().split('.');
                            var previousSavedDate = file.toString().split('.');
                            
                            if (parseInt(lastSavedDate[0]) < parseInt(previousSavedDate[0])) {
                                  await returnFTPData(advertFTPPath,file,c,dbName,stationName);
                                 // console.log("async wait end");
                            }
                          }
                        
                        console.log('after forEach');
                        asyncCall('Advert Reminder for '+stationName,'Data for the '+stationName+' has been imported');

                        //res.end('<!DOCTYPE html><html><head><title>Render index html file</title></head><body> <div style="text-align:center;color:green;"><p style="font-size:25px;">Data Has Been Imported.</p> </div></body></html>');

                    }

                    dbConnection.end();
                }
            });
        });  
    });

    c.on('error', (err) => {
        asyncCall('Error on '+stationName,'FTP Client is not connect for '+stationName+' '+err);
        retry(res,stationName,dbName,advertFTPPath);
    });

  }
  
  async function returnFTPData(advertFTPPath,fileName,c,dbName,stationName){
      console.log(advertFTPPath+fileName);
      // Await for the promise to resolve
      await new Promise((resolve) => {
        c.get(advertFTPPath + fileName, async function(err, stream) {
                
            //var content = '';
            var array = [];
            if(err !=  'Error: Unable to make data connection'){
                console.log('developer vikash : '+ advertFTPPath + fileName);
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
                    funAdvert(newDataVal, fileName);
                }

                console.log('bhoopesh');
            // console.log(insertAdvertValues);
                
                var dbConnection = mysql.createConnection({
                    host: dbConfig.hostname,
                    user: dbConfig.username,
                    password: dbConfig.password,
                    database: dbName,
                    port: 3306
                });
                dbConnection.connect();
                    var insertInfo = "INSERT INTO advertisement (name,airtime,airdate,length,advert_url,type,program_id,air_date_time,ad_name) VALUES ?";
                // console.log("received array========================= " + insertAdvertValues);
                    dbConnection.query(insertInfo, [insertAdvertValues], async function (err, result) {
                        if (err) {
                            dbConnection.end();
                            asyncCall('Error on '+stationName,'advertisement Table is not connect for '+stationName+' '+err);
                        } else {
                            console.log("data inserted");
                            insertAdvertValues = [];
                            var correctionQuery = `UPDATE advertisement SET name= TRIM(REPLACE(name, '"', '')) WHERE 1=1`;
                            dbConnection.query(correctionQuery, async function (err, result) {
                                if (err) {
                                    dbConnection.end();
                                    console.log("Updated Query Error 1: "+err);
                                    asyncCall('Error on '+stationName,'last_updated_traffic Table is not connect for '+stationName+' '+err);
                                } else {
                                    console.log("data corrected");
                                    
                                    console.log("advert tiltle corrected");
                                    var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  advertisement = ? where id= '1'`;
                                    var lastUpdatedFileValue = [fileName];
                                    dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue, async function (err, result) {
                                        if (err) {
                                            dbConnection.end();
                                            asyncCall('Error on '+stationName,'last_updated_traffic Table is not connect for '+stationName+' '+err);
                                        } else {
                                            console.log("last updated filename : " + fileName);
                                            var insertCronQuery = "INSERT INTO cronlog (updated_at,type,filename) VALUES ?";
                                            var cronValue = [[new Date(), "KRKO", fileName]];

                                            dbConnection.query(insertCronQuery, [cronValue], async function (err, result) {
                                                if (err) {
                                                    dbConnection.end();
                                                    asyncCall('Error on '+stationName,'cronlog Table is not connect for '+stationName+' '+err);
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

 async function funAdvert(content, fileName) {
    await new Promise((resolve) => {
        var data = content.split(',');
        for (var i = 0; i < data.length; i++) {
            // Trim the excess whitespace.
            data[i] = data[i].replace(/^\s*/, "").replace(/\s*$/, "");
        }
        //name,email,website,airtime,airdate,length,advert_url,type,program_id
        //00:20:00,,COM,DA1754,ALLSTATE BRIAN REED 1,ALLSTATE BRIAN REED 1,00:30,,, , , , ,,,
        var schDate = fileName.split('.');
        var yearValue = schDate[0].toString().substring(0, 2);
        var monthValue = schDate[0].toString().substring(2, 4);
        var dateValueNew = schDate[0].toString().substring(4, 6);
        //console.log('Vikash Kumar Kashyap');
    // console.log(yearValue);
    // console.log(monthValue);
    // console.log(dateValueNew);
        var dateFormated = "20" + yearValue + "-" + monthValue + "-" + dateValueNew;
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

        //console.log(data);
        var receivedAirTime = data[0];
        var hourValue = receivedAirTime.toString().substring(0, 2);
        var minValue = receivedAirTime.toString().substring(3, 5);
        var secValue = receivedAirTime.toString().substring(6, 8);

        if (parseInt(hourValue) > 23 || parseInt(minValue) >= 60 || parseInt(secValue) >= 60) {

        } else {
            // name,airtime,airdate,length,advert_url,type,program_id,air_date_time
            //00:20:00,,COM,DA1754,ALLSTATE BRIAN REED 1,ALLSTATE BRIAN REED 1,00:30,,, , , , ,,,
            var dataValue = [];
            dataValue.push(data[5]);
            dataValue.push(data[0]);
            dataValue.push(dateFormated);
            dataValue.push(data[6]);
            dataValue.push('');
            dataValue.push('COM');
            dataValue.push(data[3]);
            dataValue.push(dateFormated + ' ' + data[0]);
            dataValue.push(data[5]);
            insertAdvertValues.push(dataValue);
        // console.log(dataValue);
        // console.log("data saved");
        }
        //resolve(console.log('File array made successfully'));
    });
}

/* POST file copy */
router.get('/', function (req, res, next) {
    advertData(res,'KRKO','station99_new','/Krko/Traffic/');
    advertData(res,'KKXA','station99_test','/Kkxa/Traffic/');
});

module.exports = router;
var express = require('express');
var ps = require('process-sync');
var mysql = require('mysql');
const fs = require('fs');
var dbConfig=require('../../dbconfig');
var router = express.Router();

var lastUpdatedData, airTrafficFile, scheduleTrafficFile, advertFile;
var insertSchTrafficValues = [];
var insertAirValues = [];
var insertAdvertValues = [];


function functionSync() {
    var Client = require('ftp');
    var c = new Client();
    var advertFTPPath = '/Kkxa/Traffic/';
    var scheduledTrafficFTPPath = '/Kkxa/Music/';



    c.connect({
        host: 'ftp.station99ai.com',
        port: '21',
        // user: 'data@station99ai.com',
        // password: 'Station99.'
        user: 'kxa@station99ai.com',
        password: 'Kxa@321'
    });

    c.on('ready', function () {
        c.list(advertFTPPath, false, (error, fileslist) => {
            var fileAdvertArray = [];
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
                database: "station99_new",
                port: 3306
            });
            dbConnection.connect();
            dbConnection.query('SELECT advertisement FROM last_updated_traffic', function (err, result) {
                if (err) {
                    dbConnection.end();
                } else {
                    lastUpdatedData = result[0];
                    if (typeof lastUpdatedData === "undefined") {
                        for (var i = 1; i < fileAdvertArray.length; i++) {
                            var lastSavedDate = fileAdvertArray[1].toString().split('.');
                            var previousSavedDate = fileAdvertArray[i].toString().split('.');
                            console.log(lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                            if (parseInt(lastSavedDate[0]) <= parseInt(previousSavedDate[0])) {
                                console.log("inside : " + lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                                ps.process(advertFun, [fileAdvertArray[i], c, 'advert', advertFTPPath]);
                            }
                        }
                    } else {
                        advertFile = lastUpdatedData.advertisement;
                        console.log(" " + lastUpdatedData.advertisement);

                        for (var i = 1; i < fileAdvertArray.length; i++) {
                            var lastSavedDate = advertFile.toString().split('.');
                            var previousSavedDate = fileAdvertArray[i].toString().split('.');
                            console.log(lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                            if (parseInt(lastSavedDate[0]) < parseInt(previousSavedDate[0])) {
                                console.log("inside : " + lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                                ps.process(advertFun, [fileAdvertArray[i], c, 'advert', advertFTPPath]);
                            }
                        }
                    }
                    dbConnection.end();

                }
            });
        });

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
                database: "station99_new",
                port: 3306
            });
            dbConnection.connect();
            dbConnection.query('SELECT scheduled_airtraffic FROM last_updated_traffic', function (err, result) {
                if (err) {
                    dbConnection.end();

                } else {
                    lastUpdatedData = result[0];
                    if (typeof lastUpdatedData === "undefined") {
                        for (var i = 1; i < fileScheduleArray.length; i++) {
                            var lastSavedDate = fileScheduleArray[1].toString().split('.');
                            var previousSavedDate = fileScheduleArray[i].toString().split('.');
                            console.log(lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                            if (parseInt(lastSavedDate[0]) <= parseInt(previousSavedDate[0])) {
                                console.log("inside : " + lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                                ps.process(scheduledFun, [fileScheduleArray[i], c, 'scheduledFun', scheduledTrafficFTPPath]);
                            }
                        }
                    } else {
                        scheduleTrafficFile = lastUpdatedData.scheduled_airtraffic;

                        for (var i = 1; i < fileScheduleArray.length; i++) {
                            var lastSavedDate = scheduleTrafficFile.toString().split('.');
                            var previousSavedDate = fileScheduleArray[i].toString().split('.');
                            console.log(lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                            if (parseInt(lastSavedDate[0]) < parseInt(previousSavedDate[0])) {
                                console.log("inside : " + lastSavedDate[0] + " ===  " + previousSavedDate[0]);
                                ps.process(scheduledFun, [fileScheduleArray[i], c, 'scheduledFun', scheduledTrafficFTPPath]);
                            }
                        }
                    }

                    dbConnection.end();


                }
            });
        });
    });

    c.on('error', (err) => console.log(err));



}

/* POST file copy */
router.get('/', function (req, res, next) {
    functionSync();
});

var scheduledFun = function (fileName, c, type, scheduledTrafficFTPPath) {
    //locking the process
    ps.lock();
    setTimeout(function () {
        console.log("Message Schedule: " + " .Next message will come only after 1 seconds.");
        iterateScheduleData(fileName, c, type, scheduledTrafficFTPPath);
    }, 1000);
}

function iterateScheduleData(fileName, c, type, scheduledTrafficFTPPath) {
    c.get(scheduledTrafficFTPPath + fileName, function (err, stream) {
        var array = [];
        stream.on('data', function (chunk) {
            // content += chunk;
            array.push(chunk);
        });

        stream.on('end', function () {
            var bufferData = Buffer.concat(array).toString();
            var newData = bufferData.split("\n");

            for (var i = 0; i < newData.length - 1; i++) {
                funScheduleProgram(newData[i], fileName);
            }

            var insertInfo = "INSERT INTO scheduled_airtraffic (airdate,airtime,length,program_id,program_name,type,talent) VALUES ?";

            var dbConnection = mysql.createConnection({
                host: dbConfig.hostname,
                user: dbConfig.username,
                password: dbConfig.password,
                database: "station99_new",
                port: 3306
            });
            dbConnection.connect();
            dbConnection.query(insertInfo, [insertSchTrafficValues], function (err, result) {
                if (err) {
                    dbConnection.end();
                } else {
                    console.log("data inserted");
                    insertSchTrafficValues = [];
                    var correctionQuery = `UPDATE scheduled_airtraffic SET program_name= TRIM(REPLACE(program_name, '"', '')),talent= TRIM(REPLACE(talent, '"', '')) WHERE 1=1`;
                    dbConnection.query(correctionQuery, function (err, result) {
                        if (err) {
                            dbConnection.end();
                        } else {
                            console.log("data corrected");
                            var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  scheduled_airtraffic = ? where id= '1'`;
                            var lastUpdatedFileValue = [fileName];
                            dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue, function (err, result) {
                                if (err) {
                                    dbConnection.end();
                                } else {
                                    console.log("last updated filename : " + fileName);

                                    var insertCronQuery = "INSERT INTO cronlog (type,filename) VALUES ?";
                                    var cronValue = [["kxa", fileName]];

                                    dbConnection.query(insertCronQuery, [cronValue], function (err, result) {
                                        if (err) {
                                            dbConnection.end();
                                        } else {
                                            console.log("data logged");
                                            dbConnection.end();
                                        }
                                    });


                                }
                            });
                        }
                    });

                }
            });
            //unlocking the process
            ps.unlock();
        });

    })
}

function funScheduleProgram(content, fileName) {
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
        dataValue.push(dateFormated);
        dataValue.push(data[0]);
        dataValue.push(data[6]);
        dataValue.push(data[3]);
        dataValue.push(data[4]);
        dataValue.push(data[2]);
        dataValue.push(data[5]);
        insertSchTrafficValues.push(dataValue);
        console.log("data saved");
    }


}

var advertFun = function (fileName, c, type, advertFTPPath) {
    //locking the process
    ps.lock();
    setTimeout(function () {
        console.log("Message Advert: " + " .Next message will come only after 1 seconds.");
        iterateAdvertData(fileName, c, type, advertFTPPath);
    }, 1000);
}

function iterateAdvertData(fileName, c, type, advertFTPPath) {
    c.get(advertFTPPath + fileName, function (err, stream) {
        var array = [];
        stream.on('data', function (chunk) {
            // content += chunk;
            array.push(chunk);
        });

        stream.on('end', function () {
            var bufferData = Buffer.concat(array).toString();
            var newData = bufferData.split("\n");

            for (var i = 0; i < newData.length - 1; i++) {
                funAdvert(newData[i], fileName);
            }
            var dbConnection = mysql.createConnection({
                host: dbConfig.hostname,
                user: dbConfig.username,
                password: dbConfig.password,
                database: "station99_new",
                port: 3306
            });
            dbConnection.connect();
            var insertInfo = "INSERT INTO advertisement (name,airtime,airdate,length,advert_url,type,program_id,air_date_time,ad_name) VALUES ?";
            // console.log("received array======== ================= " + insertAdvertValues);
            dbConnection.query(insertInfo, [insertAdvertValues], function (err, result) {
                if (err) {
                    dbConnection.end();
                } else {
                    console.log("data inserted");
                    insertAdvertValues = [];
                    var correctionQuery = `UPDATE advertisement SET name= TRIM(REPLACE(name, '"', '')) WHERE 1=1`;
                    dbConnection.query(correctionQuery, function (err, result) {
                        if (err) {
                            dbConnection.end();
                        } else {
                            console.log("data corrected");
                            var titleCaseQuery = `UPDATE advertisement SET name = convertToTitleCase(name),ad_name = convertToTitleCase(ad_name) where id >=1`;
                            dbConnection.query(titleCaseQuery, function (err, result) {
                                if (err) {
                                    dbConnection.end();
                                } else {
                                    console.log("advert tiltle corrected");
                                    var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  advertisement = ? where id= '1'`;
                                    var lastUpdatedFileValue = [fileName];
                                    dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue, function (err, result) {
                                        if (err) {
                                            dbConnection.end();
                                        } else {
                                            console.log("last updated filename : " + fileName);
                                            var insertCronQuery = "INSERT INTO cronlog (updated_at,type,filename) VALUES ?";
                                            var cronValue = [[new Date(), "kxa", fileName]];

                                            dbConnection.query(insertCronQuery, [cronValue], function (err, result) {
                                                if (err) {
                                                    dbConnection.end();
                                                } else {
                                                    console.log("data logged");
                                                    dbConnection.end();
                                                }
                                            });


                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            //unlocking the process
            ps.unlock();
        });

    })
}

function funAdvert(content, fileName) {

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
    console.log(yearValue);
    console.log(monthValue);
    console.log(dateValueNew);
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

    console.log(data);
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
        console.log(dataValue);
        console.log("data saved");
    }

}


module.exports = router;
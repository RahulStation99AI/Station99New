var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbConfig=require('../../../dbconfig');

var asyncCall = require('../sendMail')
var advertAzurePath = "connectfm/aquira/";
var chunks = [];
var insertAdvertValues = [];
var fileAdvertArray = [];
var lengthArr = [];
var previousTime = '';
var fileExist = [];
const { ShareServiceClient, StorageSharedKeyCredential } = require("@azure/storage-file-share");
 
const account = "webimages99";
const accountKey = "7EzHWppQUlzV+1u/Xv+f1K1pkDS94ep5Sf8d8XdK7D7ExHwDyOttEGkeUOUabyMCqIaLfBCkZCyKIh/WQtKsgw==";
 
 
// [Node.js only] A helper method used to read a Node.js readable stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    chunks = [];
    readableStream.on("data", (data) => {
      //chunks.push(data.toString());
      chunks.push(data);
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}
 
const credential = new StorageSharedKeyCredential(account, accountKey);
const serviceClient = new ShareServiceClient(
  `https://${account}.file.core.windows.net`,
  credential
);
 
const shareName = "radiostations";
const directoryName = "connectfm/aquira";
 
async function main(dbName,stationName) {
  fileAdvertArray = [];
  fileExist = [];

  const directoryClient = serviceClient.getShareClient(shareName).getDirectoryClient(directoryName);
 
  let dirIter = directoryClient.listFilesAndDirectories();
  let i = 1;
  let item = await dirIter.next();
  while (!item.done) {
    if (item.value.kind === "directory") {
      console.log(`${i} - directory\t: ${item.value.name}`);
    } else {
      console.log(`${i} - file\t: ${item.value.name}`);
     // console.log(`${i} - file\t: ${item.name}`);
      var fn = item.value.name.split('.').pop();
      if(fn == 'txt'){
        
        var fileList = item.value.name.toString().split('.');
        var eachFileArr = fileList[0].toString().split('-');

        
        
        if(eachFileArr[0].trim() == 'Daily Log Report for App'){
          
          var dateData = eachFileArr[3].trim();
          var dateArr = dateData.toString().split(' ');

          if(fileExist.indexOf(dateArr[0]) !== -1){
            
            console.log('File Exists on server');
            
          } else{
            
              console.log('File Not Exists on server');
              fileExist.push(dateArr[0]);
              fileAdvertArray.push(item.value.name);

          }

        }

      }

    }
    item = await dirIter.next();
    i++;
  }
  
  console.log(fileAdvertArray);

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
          //console.log(lastUpdatedData);
          if (typeof lastUpdatedData === "undefined") {
          
          } else {
              advertFile = lastUpdatedData.advertisement;
              //console.log(fileAdvertArray);
              for (const file of fileAdvertArray) {
                
                  var lastSavedDate = advertFile.toString().split('.');
                  
                  var previousSavedDate = file.toString().split('.');
                  var serverFileArr = previousSavedDate[0].toString().split('-');

                  
                    var dateData = serverFileArr[3].trim();
                    var dateArr = dateData.toString().split(' ');
                    
                    if (parseInt(lastSavedDate[0]) < parseInt(dateArr[0])) {
                      console.log('dateArr dateArr dateArr dateArr : '+dateArr[0]+' vikash '+lastSavedDate[0]);
                      await funcReadAdvertData(advertAzurePath,file,dbName,stationName);
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
}


async function funcReadAdvertData(advertAzurePath,fileName,dbName,stationName){

  
  const fileClient = serviceClient
    .getShareClient(shareName)
    .rootDirectoryClient.getFileClient(advertAzurePath+fileName);

    const downloadFileResponse = await fileClient.download();
  
    await streamToString(downloadFileResponse.readableStreamBody);
    
    // console.log(chunks);
    var bufferData = Buffer.concat(chunks).toString();
      var newData = bufferData.split("\n");
      await new Promise((resolve) => {
      console.log(newData);
      insertAdvertValues = [];
      lengthArr = [];
      //console.log("insertAdvertValues Before : "+insertAdvertValues);
      for (const newDataVal of newData) {
        
        funAdvertishmentProgram(newDataVal);
      }
     // console.log("insertAdvertValues After : "+insertAdvertValues);

      if(insertAdvertValues.length > 0){
          
        var dbConnection = mysql.createConnection({
          host: dbConfig.hostname,
          user: dbConfig.username,
          password: dbConfig.password,
          database: dbName,
          port: 3306
      });
          dbConnection.connect();
          var insertInfo = "INSERT INTO advertisement (name,airtime,airdate,length,program_id,type,air_date_time,automation_code,ad_name,advertisher_id,file_name) VALUES ?";
      // console.log("received array========================= " + insertAdvertValues);
          dbConnection.query(insertInfo, [insertAdvertValues], async function (err, result) {
              if (err) {
                  dbConnection.end();
                  asyncCall('Error on '+stationName,'advertisement Table is not connect for '+stationName+' '+err);
              } else {

                previousSavedDate = fileName.toString().split('.');
                serverFileArr = previousSavedDate[0].toString().split('-');

                dateData = serverFileArr[3].trim();
                dateArr = dateData.toString().split(' ');
                var newFileName = dateArr[0]+'.txt';
                  

                  console.log("data inserted");
                  insertAdvertValues = [];
                  lengthArr = [];
                  var correctionQuery = `UPDATE advertisement SET name= TRIM(REPLACE(name, '"', '')) WHERE 1=1`;
                  dbConnection.query(correctionQuery, async function (err, result) {
                      if (err) {
                          dbConnection.end();
                          console.log("Updated Query Error 1: "+err);
                          asyncCall('Error on '+stationName+' advertisement','advertisement trim Table is not connect for '+stationName+' '+err);
                      } else {
                          console.log("data corrected");
                          
                          console.log("advert tiltle corrected");
                          var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  advertisement = ? where id= '1'`;
                          var lastUpdatedFileValue = [newFileName];
                          dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue, async function (err, result) {
                              if (err) {
                                  dbConnection.end();
                                  asyncCall('Error on '+stationName+' advertisement','last_updated_traffic Table is not connect for '+stationName+' '+err);
                              } else {
                                  console.log("last updated filename : " + newFileName);
                                  var insertCronQuery = "INSERT INTO cronlog (updated_at,type,filename) VALUES ?";
                                  var cronValue = [[new Date(), 'Advertisement' , newFileName+'.txt']];

                                  dbConnection.query(insertCronQuery, [cronValue], async function (err, result) {
                                      if (err) {
                                          dbConnection.end();
                                          asyncCall('Error on '+stationName+' advertisement','cronlog Table is not connect for '+stationName+' '+err);
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
      }
    });
}

async function funAdvertishmentProgram(content) {
  await new Promise((resolve) => {
      var data = content.split(',');
      var dataValue = [];
      var airDate = '';
      var airTime = '00:00:00';

      var air_date_time = '';
      if(data.length > 7){
// name,airtime,airdate,length,program_id,type,air_date_time,automation_code,ad_name,advertisher_id,file_name
        if(data[0] != "Advertiser Name"){
          
          var lenght = data[3];
          
          dataValue.push(data[0]);

          // airDate = data[1].split("/").reverse().join("-");
          airDate = data[1];

          if(data[2] != ''){
            
            var [time, modifier] = data[2].split(' ');

            let [hours, minutes] = time.split(':');

            if (hours === '12') {
              hours = '00';
            }

            if (modifier === 'PM') {
              hours = parseInt(hours, 10) + 12;
            }

            airTime = `${hours}:${minutes}:${'00'}`;

            air_date_time = airDate +' '+airTime;
            var dt = new Date(air_date_time);
            
            if(previousTime == data[2]){
              console.log('Previous Time : '+data[2]);
            }else{
              lengthArr = []
              previousTime = data[2];
              console.log('New Time : '+data[2]);
            }

            for (const file of lengthArr){
              dt.setSeconds( dt.getSeconds() + parseInt(file) );
            }

            var airTimeSecond = dt.getSeconds();
            if(airTimeSecond.length > 1){
              airTime = dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()
            }else{
              airTime = dt.getHours()+':'+dt.getMinutes()+':0'+dt.getSeconds()
            }
            dataValue.push(airTime);
            air_date_time = dt;
          }else{
            
            air_date_time = airDate +' '+airTime;
            var dt = new Date(air_date_time);
            
            for (const file of lengthArr){
              dt.setSeconds( dt.getSeconds() + parseInt(file) );
            }
            
            var airTimeSecond = dt.getSeconds();
            if(airTimeSecond.length > 1){
              airTime = dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds()
            }else{
              airTime = dt.getHours()+':'+dt.getMinutes()+':0'+dt.getSeconds()
            }

            dataValue.push(airTime);
            air_date_time = dt;
          }
          
          dataValue.push(airDate);
          
          dataValue.push(lenght);
          dataValue.push(data[4]);
          dataValue.push(data[5]);  
          dataValue.push(air_date_time);
          dataValue.push(data[7]);
          dataValue.push(data[0]);
          dataValue.push(data[8]);
          dataValue.push(data[9]);
          insertAdvertValues.push(dataValue);
          
          lengthArr.push(lenght);
        }

      }
      
      resolve();
    });
}


/* POST login with req body */
router.post('/',async function (req, res, next) {
  //var dbName = req.headers.db_name;
  var dbName = 'connect_fm';
   await main(dbName,'Connect FM');
    res.send(JSON.stringify({ "status": 200, "response":{},"message": "success", "success": true }));
    
});

module.exports = router;
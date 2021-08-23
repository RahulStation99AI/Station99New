var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dbConfig=require('../../../dbconfig');

var asyncCall = require('../sendMail')
var customerAzurePath = "connectfm/aquira/";

var chunks = [];
var insertCustomerValues = [];
var fileCustomerArray = [];
var fileExist = [];

var customerAlliasIdArr = [];
var customerNameArr = [];
var filterInsert = [];
var filterInsertArr = [];
var filterUpdate = [];
var filterUpdateArr = [];
var filterAdvertAlliasNewUpdate = [];
var filterAdvertAlliasNewInsert = [];
var filterAdvertAlliasNewInsertArr = [];
var filterAdvertAlliasNewUpdateArr = [];
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
  
  fileCustomerArray = [];
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
        
        if(eachFileArr[0].trim() == 'Daily Client List for App'){
  
          var dateData = eachFileArr[3].trim();
          var dateArr = dateData.toString().split(' ');

          if(fileExist.indexOf(dateArr[0]) !== -1){
            console.log('File Exists on server');
          } else{
              console.log('File Not Exists on server');
              fileExist.push(dateArr[0]);
              fileCustomerArray.push(item.value.name);
          }
        }

      }

    }
    item = await dirIter.next();
    i++;
  }
  
  console.log(fileCustomerArray);

  var dbConnection = mysql.createConnection({
    host: dbConfig.hostname,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbName,
    port: 3306
  });
  dbConnection.connect();
  dbConnection.query('SELECT customer_info FROM last_updated_traffic', async function (err, result) {
      if (err) {
          dbConnection.end();
      } else {
        
          lastUpdatedData = result[0];
          console.log(lastUpdatedData);
          if (typeof lastUpdatedData === "undefined") {
          
          } else {
              customerFile = lastUpdatedData.customer_info;
              // console.log(fileCustomerArray);
              for (const file of fileCustomerArray) {
                
                //console.log(file);

                  var lastSavedDate = customerFile.toString().split('.');
                  var previousSavedDate = file.toString().split('.');

                  var serverFileArr = previousSavedDate[0].toString().split('-');
                  
                    var dateData = serverFileArr[3].trim();
                    var dateArr = dateData.toString().split(' ');
                    
                    if (parseInt(lastSavedDate[0]) < parseInt(dateArr[0])) {
                      console.log('dateArr dateArr dateArr dateArr : '+dateArr[0]+' vikash '+lastSavedDate[0]);
                      await funcReadCustomerData(customerAzurePath,file,dbName,stationName,dateArr[0]);
                      // console.log("async wait end");
                    }
                }
              
              console.log('after forEach');
            //  asyncCall('Customer Reminder for '+stationName,'Data for the Customer Info '+stationName+' has been imported');

              //res.end('<!DOCTYPE html><html><head><title>Render index html file</title></head><body> <div style="text-align:center;color:green;"><p style="font-size:25px;">Data Has Been Imported.</p> </div></body></html>');

          }

          dbConnection.end();
      }
  });
}


async function funcReadCustomerData(customerAzurePath,fileName,dbName,stationName,newFileName){

  
  const fileClient = serviceClient
    .getShareClient(shareName)
    .rootDirectoryClient.getFileClient(customerAzurePath+fileName);

    const downloadFileResponse = await fileClient.download();
  
    await streamToString(downloadFileResponse.readableStreamBody);
    
    // console.log(chunks);
    var bufferData = Buffer.concat(chunks).toString();
      var newData = bufferData.split("\n");
      await new Promise((resolve) => {
      console.log(newData);
      insertCustomerValues = [];
      
      for (const newDataVal of newData) {
        
        funCustomerInfoProgram(newDataVal);
      }
      
     // console.log("insertAdvertValues After : "+insertCustomerValues);

      if(insertCustomerValues.length > 0){

          console.log(insertCustomerValues.length);

      var dbConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbName,
        port: 3306
      });
      
      dbConnection.connect();

      var selectCustomerInfo = "SELECT customer_allias_id,company FROM customer_info";
      
          dbConnection.query(selectCustomerInfo, async function (err, results) {
              if (err) {
                  dbConnection.end();
              } else {
                
                customerAlliasIdArr = [];
                customerNameArr = [];

                for await (result of results){
                                    
                  customerAlliasIdArr.push(result.customer_allias_id);
                  customerNameArr.push(result.company);

                }

               // console.log(customerAlliasIdArr);
               // console.log(customerNameArr);
               filterInsertArr = [];
               filterUpdateArr = [];

               filterAdvertAlliasNewInsertArr = [];
               filterAdvertAlliasNewUpdateArr = [];
               var counter = 0;
                for await (insertCustomerValue of insertCustomerValues){

                  // check data for customer info table
                  if(customerAlliasIdArr.indexOf(parseInt(insertCustomerValue[0])) !== -1){
                    
                    filterUpdate = [];
                    filterUpdate.push(insertCustomerValue[1]);
                    filterUpdate.push(insertCustomerValue[2]);
                    filterUpdate.push(insertCustomerValue[3]);
                    filterUpdate.push(insertCustomerValue[4]);
                    filterUpdate.push(insertCustomerValue[5]);
                    filterUpdate.push(insertCustomerValue[6]);
                    filterUpdate.push(insertCustomerValue[7]);
                    filterUpdate.push(insertCustomerValue[8]);
                    filterUpdate.push(insertCustomerValue[9]);
                    filterUpdate.push(insertCustomerValue[10]);
                    filterUpdate.push(insertCustomerValue[11]);
                    filterUpdate.push(insertCustomerValue[12]);
                    filterUpdate.push(insertCustomerValue[13]);
                    filterUpdate.push(insertCustomerValue[0]);
                    filterUpdateArr.push(filterUpdate);
                    // await funUpdateCustomerInfoTable(dbName);
                  //  await funUpdateCustomerInfoTable(insertCustomerValue[0],insertCustomerValue[1],insertCustomerValue[2],insertCustomerValue[3],insertCustomerValue[4],insertCustomerValue[5],insertCustomerValue[6],insertCustomerValue[7],insertCustomerValue[8],insertCustomerValue[9],insertCustomerValue[10],insertCustomerValue[11],insertCustomerValue[12],dbName);
              
                  } else{

                    filterInsert = [];
                    filterInsert.push(insertCustomerValue[0]);
                    filterInsert.push(insertCustomerValue[1]);
                    filterInsert.push(insertCustomerValue[2]);
                    filterInsert.push(insertCustomerValue[3]);
                    filterInsert.push(insertCustomerValue[4]);
                    filterInsert.push(insertCustomerValue[5]);
                    filterInsert.push(insertCustomerValue[6]);
                    filterInsert.push(insertCustomerValue[7]);
                    filterInsert.push(insertCustomerValue[8]);
                    filterInsert.push(insertCustomerValue[9]);
                    filterInsert.push(insertCustomerValue[10]);
                    filterInsert.push(insertCustomerValue[11]);
                    filterInsert.push(insertCustomerValue[12]);
                    filterInsert.push(insertCustomerValue[13]);
                    filterInsertArr.push(filterInsert);
                      
                  }

                  // Check Data for advertisher allias table
                if(customerNameArr.indexOf(insertCustomerValue[1]) !== -1){

                  filterAdvertAlliasNewUpdate = [];
                  filterAdvertAlliasNewUpdate.push(insertCustomerValue[1]);
                  filterAdvertAlliasNewUpdate.push(insertCustomerValue[0]);
                  filterAdvertAlliasNewUpdateArr.push(filterAdvertAlliasNewUpdate);
          
                } else{
            
                  filterAdvertAlliasNewInsert = [];
                  filterAdvertAlliasNewInsert.push(insertCustomerValue[1]);
                  filterAdvertAlliasNewInsert.push(insertCustomerValue[0]);
                  
                  filterAdvertAlliasNewInsertArr.push(filterAdvertAlliasNewInsert);
                } 

                  counter++;
                }

                if(filterInsertArr.length > 0){
                  console.log('filterInsertArr : '+filterInsertArr);
                  await funInsertCustomerInfoTable(dbName);
                }

                if(filterAdvertAlliasNewInsertArr.length > 0){
                  console.log('filterAdvertAlliasNewInsertArr : '+filterAdvertAlliasNewInsertArr);
                  await funInsertAdvertAlliasNewTable(dbName);
                }

                if(filterUpdateArr.length > 0){
                  console.log('filterUpdateArr : '+filterUpdateArr);
                  for(filterUpdateAr of filterUpdateArr){
  
                    await funUpdateCustomerInfoTable(filterUpdateAr,dbName);
      
                  }

                }

                if(filterAdvertAlliasNewUpdateArr.length > 0){
                  console.log('filterAdvertAlliasNewUpdateArr : '+filterAdvertAlliasNewUpdateArr);
                  for(filterAdvertAlliasNewUpdateAr of filterAdvertAlliasNewUpdateArr){
  
                    await funUpdateAdvertAlliasNewTable(filterAdvertAlliasNewUpdateAr,dbName);
      
                  }

                }

                

                if(counter === insertCustomerValues.length){
                  
                  console.log("data inserted");
                  insertCustomerValues = [];
                                
                  var lastUpdatedFileQuery = `UPDATE last_updated_traffic SET  customer_info = ? where id= '1'`;
                  var lastUpdatedFileValue = [newFileName+'.txt'];
                  dbConnection.query(lastUpdatedFileQuery, lastUpdatedFileValue, async function (err, result) {
                      if (err) {
                          dbConnection.end();
                          asyncCall('Error on '+stationName,'last_updated_traffic Table is not connect for '+stationName+' '+err);
                      } else {
                          console.log("last updated filename : " + newFileName);
                          var insertCronQuery = "INSERT INTO cronlog (updated_at,type,filename) VALUES ?";
                          var cronValue = [[new Date(), 'customer_info' , newFileName+'.txt']];

                          dbConnection.query(insertCronQuery, [cronValue], async function (err, result) {
                              if (err) {
                                  dbConnection.end();
                                  asyncCall('Error on '+stationName+' customer_info.','cronlog Table is not connect for '+stationName+' '+err);
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
              // Resolve the promise
                
              }
            });
        }else{
          resolve();
        }
    });
}


async function funUpdateCustomerInfoTable(filterUpdateAr,dbName) {
  await new Promise((resolve) => {
    
    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbName,
      port: 3306
    });
    
    dbConnection.connect();
    var updateQuery = 'update customer_info set company = ?, phone = ?, company_email = ?, user_login_email = ?, address1 = ?,address2 = ?, city = ?, state = ?, zipcode = ?, country = ?, website = ?, facebook_page_link = ?, industry = ? where customer_allias_id = ?';
      
        dbConnection.query(updateQuery,filterUpdateAr, async function (err, result) {
          if (err) {
             // dbConnection.end();
              console.log(err);
              resolve();
          } else {
            console.log('Value Updated!');
           // dbConnection.end();
            resolve();
          }
          dbConnection.end();
        });

       resolve();
    });
}

async function funInsertCustomerInfoTable(dbName) {
  await new Promise((resolve) => {

    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbName,
      port: 3306
    });
    
    dbConnection.connect();
    var insertInfo = "INSERT INTO customer_info (customer_allias_id,company,phone,company_email,user_login_email,address1,address2,city,state,zipcode,country,website,facebook_page_link,industry) VALUES ?";
      // console.log("received array========================= " + insertCustomerValues);
          dbConnection.query(insertInfo,[filterInsertArr], async function (err, result) {
              if (err) {
                  dbConnection.end();
                  console.log(err);
                  resolve();
              } else {
                console.log('Value Inserted!');
                dbConnection.end();
                resolve();
              }
            });
    });
}

async function funUpdateAdvertAlliasNewTable(filterAdvertAlliasNewUpdateAr,dbName) {
  await new Promise((resolve) => {
    
    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbName,
      port: 3306
    });
    
    dbConnection.connect();
    var updateQueryAd = 'update advertiser_alias_new set advertiser_name = ? where customer_allias_id = ?';
      
        dbConnection.query(updateQueryAd,filterAdvertAlliasNewUpdateAr, async function (err, result) {
          if (err) {
             // dbConnection.end();
              console.log(err);
              resolve();
          } else {
            console.log('Value Updated advertiser_alias_new!');
           // dbConnection.end();
            resolve();
          }
          dbConnection.end();
        });

        resolve();
    });
}

async function funInsertAdvertAlliasNewTable(dbName) {
  await new Promise((resolve) => {

    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: dbName,
      port: 3306
    });
    
    dbConnection.connect();
    var insertInfoAdv = "INSERT INTO advertiser_alias_new (advertiser_name,customer_allias_id) VALUES ?";
      // console.log("received array========================= " + insertCustomerValues);
          dbConnection.query(insertInfoAdv,[filterAdvertAlliasNewInsertArr], async function (err, result) {
              if (err) {
                  dbConnection.end();
                  console.log(err);
                  resolve();
              } else {
                console.log('Value Inserted advertiser_alias_new!');
                dbConnection.end();
                resolve();
              }
            });
    });
}

function splitCsv(str) {
  return str.split(',').reduce((accum,curr)=>{
    if(accum.isConcatting) {
      accum.soFar[accum.soFar.length-1] += ','+curr
    } else {
      accum.soFar.push(curr)
    }
    if(curr.split('"').length % 2 == 0) {
      accum.isConcatting= !accum.isConcatting
    }
    return accum;
  },{soFar:[],isConcatting:false}).soFar
}

async function funCustomerInfoProgram(content) {
  await new Promise((resolve) => {
      // var data = content.split(',');
      var data = splitCsv(content);
      //console.log('data : '+data);
      var dataValue = [];
      if(data.length > 7){
        // customer_allias_id,company,phone,company_email,user_login_email,address1,address2,city,state,zipcode,country,website,facebook_page_link,industry
        // Client ID,Client Name,BusinessPhone1,Email Address,Client Postal Address,Client Postal Suburb,Client Postal City,Client Physical Region,Client Postal PostalCode,Client Postal Country,Advertiser Website,Advertiser Facebook,Advertiser Industry,Sales Rep Name

        // city,state,zipcode,country,website,facebook_page_link,industry
        // Client Postal Suburb,Client Postal City,Client Physical Region,Client Postal PostalCode,Client Postal Country,Advertiser Website,Advertiser Facebook,Advertiser Industry,Sales Rep Name
        // Unit 107,Surrey,BC,V3W 2V7,Canada,,,,Tejinder Singhv
        if(data[0] != "Client ID"){
            dataValue.push(data[0]);
            dataValue.push(data[1]);
            dataValue.push(data[2]);
            dataValue.push(data[3]);
            dataValue.push(data[3]);
            dataValue.push(data[4]);
            dataValue.push(data[5]);
            dataValue.push(data[6]);
            dataValue.push(data[7]);
            dataValue.push(data[8]);
            dataValue.push(data[9]);
            dataValue.push(data[10]);
            dataValue.push(data[11]);
            dataValue.push(data[12]);
            insertCustomerValues.push(dataValue);
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
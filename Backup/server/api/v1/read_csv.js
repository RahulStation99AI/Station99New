var express = require('express');
var router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');

var mysql = require('mysql');
var dbConfig=require('../../dbconfig');

var insertArr = [];
var insertAdvertiserAlliasArr = [];
var updateArr = [];
var compareArr = [];
var last_customer_id = 0;
router.get('/',async function (req, res, next) {
  new Promise((resolve, reject) => {  
  console.log('dfdfd');
    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: 'station99_new',
      port: 3306
    });
    dbConnection.connect();
    var querySelect = "select ﻿id as customer_id,company from customer_info_new order by ﻿id desc";
    dbConnection.query(querySelect, async function (err, result) {
        if (err) {
            dbConnection.end();
        } else {
          
            for(var i = 0; i <result.length;i++){
              compareArr.push(result[i].company);
              if(i === 0){
                last_customer_id = parseInt(result[i].customer_id);
              }
            }

            if(compareArr.length > 0){
              readCsv();
            }
        }
      });
    });
});


async function readCsv(){
  new Promise((resolve, reject) => {
    fs.createReadStream('Radio_Stations_Company_List3-3.csv')
    .pipe(csv())
    .on('data', (row) => {
      makecustomerArr(row);
    })
    .on('end', () => {
      // insertData('station99_new');
      
      resolve(console.log('CSV file successfully processed'));
      
      console.log('Insert arr');
      console.log(insertArr.length);
      console.log('advertiser arr');
      console.log(insertAdvertiserAlliasArr.length);
      console.log('Update Array Data');
      console.log(updateArr.length);

      
      insertData('station99_new');

      insertAdvertiserData('station99_new');

      for(var j = 0; j < updateArr.length; j++){
        updateData('station99_new',updateArr[j]);
      }
      
    });
    
  });
}

async function makecustomerArr(row){
  new Promise((resolve, reject) => {
    var eachArr = [];
    var advertiserAlliasEachArr = [];
   
    //customer_allias_id, company,phone,address1,city,state,zipcode,website,industry,record_manager,company_email,user_login_email,subscribed

    if(compareArr.indexOf(row.company) !== -1){

      console.log("Value exists!");
      // 
      eachArr.push(row.company);
      eachArr.push(row.phone);
      eachArr.push(row.address1);
      eachArr.push(row.city);
      eachArr.push(row.state);
      eachArr.push(row.zipcode);
      eachArr.push(row.website);
      eachArr.push(row.industry);
      eachArr.push(row.record_manager);
      eachArr.push(row.company_email);
      eachArr.push(row.company_email);
      eachArr.push('1');
      eachArr.push(row.company);
      updateArr.push(eachArr);

    } else{
      console.log('Value does not exist.');
      
      last_customer_id = last_customer_id+1;
      
      eachArr.push(last_customer_id+'0');
      eachArr.push(row.company);
      eachArr.push(row.phone);
      eachArr.push(row.address1);
      eachArr.push(row.city);
      eachArr.push(row.state);
      eachArr.push(row.zipcode);
      eachArr.push(row.website);
      eachArr.push(row.industry);
      eachArr.push(row.record_manager);
      eachArr.push(row.company_email);
      eachArr.push(row.company_email);
      eachArr.push('1');
      insertArr.push(eachArr);

      advertiserAlliasEachArr.push(row.company);
      advertiserAlliasEachArr.push(last_customer_id+'0');
      insertAdvertiserAlliasArr.push(advertiserAlliasEachArr);
    }
    resolve();
  });
}

function insertData(dbName){
  new Promise((resolve, reject) => {
    if(insertArr.length > 0){
            
      var dbConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbName,
        port: 3306
    });
    dbConnection.connect();
     var insertInfo = "INSERT INTO customer_info_new (customer_allias_id,company,phone,address1,city,state,zipcode,website,industry,record_manager,company_email,user_login_email,subscribed) VALUES ?";
     dbConnection.query(insertInfo, [insertArr], async function (err, result) {
        if (err) {
             dbConnection.end();
         } else {
           console.log('Value Inserted Successfull');
         }
       });
    }
  });
}

function insertAdvertiserData(dbName){
  new Promise((resolve, reject) => {
    if(insertAdvertiserAlliasArr.length > 0){
            
      var dbConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbName,
        port: 3306
    });
    dbConnection.connect();
     var insertInfo = "INSERT INTO advertiser_alias_new_clean (advertiser_name,customer_allias_id) VALUES ?";
     dbConnection.query(insertInfo, [insertAdvertiserAlliasArr], async function (err, result) {
        if (err) {
             dbConnection.end();
         } else {
           console.log('Value Inserted Successfull');
         }
       });
    }
  });
}


async function updateData(dbName,fileData){
  new Promise((resolve, reject) => {
            
    var db_config = {
        host: dbConfig.hostname,
          user: dbConfig.username,
          password: dbConfig.password,
          database: dbName,
          port: 3306
    };
    
    var connection;
    
    function handleDisconnect() {
      connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                      // the old one cannot be reused.
    
      connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
      });                                     // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
      connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
          handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
          throw err;                                  // server variable configures this)
        }
      });
    }
    
    handleDisconnect();

      var sql = "UPDATE customer_info_new set company = ?,phone = ?,address1 = ?,city = ?,state = ?,zipcode = ?,website = ?,industry = ?,record_manager = ?,company_email = ?,user_login_email = ?,subscribed = ?  WHERE company = ?";
      
      connection.query(sql, fileData , function(err, result) {
          
          if (err) {
            console.log(err);
            connection.end();
        } else {
          console.log("Record Updated!!");
          resolve(console.log(result));
        }
      });
  });
}

module.exports = router;

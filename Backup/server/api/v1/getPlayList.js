var express = require('express');
var mysql = require('mysql');
var dbConfig=require('../../dbconfig');
var router = express.Router();
var asyncCall = require('./sendMail');
// Node.js
const { google } = require('googleapis');
const youtube = google.youtube('v3');
var insertPlayListValues = [];

var recordArr = [];
  

router.get('/', async function (req, res, next) {

    // Get All Play List Item for the particular Playlist END

    // Get All PlayList START
    var dbConnection = mysql.createConnection({
      host: dbConfig.hostname,
      user: dbConfig.username,
      password: dbConfig.password,
      database: 'connect_fm',
      port: 3306
    });

    youtube.playlists.list({
    key: 'AIzaSyDoL4rYtt4RrX8CSqhS-vC4gtrEuFMZAXQ',
    part: 'snippet',
    channelId: 'UChVmpG7svTIbwlA1Ie4BfKA',
    maxResults: 1000,
    }, (err, results) => {
        if(err){
          res.send(JSON.stringify({ "status": 200, "error": err, "response": err.message, "success": true }));
        }else{
          var items = results.data.items;
          dbConnection.connect();
          var checkRecordQuery = "select playlist_id from connect_fm_playlist";
          dbConnection.query(checkRecordQuery, async function (error, resultData, fields) {
            if (error) {
              dbConnection.end();
            } else {
              for(var i = 0; i < resultData.length; i++){
                var playlist_id = resultData[i].playlist_id;
                getAllPlaylistReocrd(playlist_id);
              }
              console.log(recordArr);
              items.forEach(function(element) 
              { 
                var etag = element.etag;
                var snippet = element.snippet;
                var title = snippet.title;
                var channelTitle = snippet.channelTitle;
                
                var channelId = snippet.channelId;
                var playlistId = element.id;
                var publishedAt = snippet.publishedAt;
                var thumbnails = snippet.thumbnails;
                var thumbnail_medium = thumbnails.medium.url;
                var thumbnail_high = thumbnails.high.url;

                try {
                  var thumbnail_medium = thumbnails.medium.url;
                }
                catch(err) {
                    var thumbnail_medium = "";
                }

                try {
                    var thumbnail_high = thumbnails.high.url;
                }
                catch(err) {
                    var thumbnail_high = "";
                }

                if(recordArr.indexOf(playlistId) !== -1){

                    console.log("Value exists!")
            
                } else{
                  console.log('Value does not exist.');
                  var dataValue = [];
                  dataValue.push(etag);
                  dataValue.push(title);
                  dataValue.push(channelTitle);
                  dataValue.push(channelId);
                  dataValue.push(playlistId);
                  dataValue.push(publishedAt);
                  dataValue.push(thumbnail_medium);
                  dataValue.push(thumbnail_high);
                  insertPlayListValues.push(dataValue);
                }
              });

              if(insertPlayListValues.length > 0){
                var insertInfo = "INSERT INTO connect_fm_playlist (`etag`,`title`,`channel_title`,`channel_id`,`playlist_id`,`published_at`,`thumbnail_medium`,`thumbnail_high` ) VALUES ?";
                dbConnection.query(insertInfo, [insertPlayListValues], async function (err, result) {
                  if (err) {
                    dbConnection.end();
                    res.send(JSON.stringify({ "status": 200, "error": err, "response": 'Issue while file importing', "success": false }));
                  } else { 
                    console.log(insertPlayListValues);
                    insertPlayListValues = [];
                    res.send(JSON.stringify({ "status": 200, "error": err, "response": 'File Import', "success": true }));
                  }
                });
              }else{
                res.send(JSON.stringify({ "status": 200, "error": err, "response": 'No Changes in File yet.', "success": true }));
              }

            }
          });
        }        
    });
    // Get All PlayList END
 });

 async function getAllPlaylistReocrd(playlist_id){
  await new Promise((resolve) => {
    
    recordArr.push(playlist_id);
   // resolve(console.log('File array made successfully'));
  });
 }
 
 module.exports = router;
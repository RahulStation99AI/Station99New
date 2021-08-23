var express = require('express');
var mysql = require('mysql');
var dbConfig=require('../../dbconfig');
var router = express.Router();
var asyncCall = require('./sendMail');
// Node.js
const { google } = require('googleapis');
const youtube = google.youtube('v3');
var insertPlayListItemValues = [];

var recordArr = [];
  
async function insertPlaylistItem(req, res){

    // Get All PlayList START
    var dbConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: 'connect_fm',
        port: 3306
    });
      
      dbConnection.connect();
      var checkRecordQuery = "select etag,playlist_id from connect_fm_playlist";
      dbConnection.query(checkRecordQuery, async function (error, resultData, fields) {
          if (error) {
              dbConnection.end();
          } else {
        
                for (const file of resultData) {
                      console.log(file.etag);
                      console.log(file.playlist_id); 
                      var playlistEtag = file.etag; 
                      var playlist_id = file.playlist_id;
                      await getAllPlaylistItemRecord(playlistEtag,playlist_id,'AIzaSyDoL4rYtt4RrX8CSqhS-vC4gtrEuFMZAXQ');
                     // console.log("async wait end");
                     console.log(insertPlayListItemValues.length);
                     
                     if(insertPlayListItemValues.length > 0){
                        var insertInfo = "INSERT INTO connect_fm_playlist_item (`etag`,`title`,`channel_title`,`channel_id`,`playlist_id`,`playlist_item_id`,`published_at`,`thumbnail_medium`,`thumbnail_high`,`video_id` ) VALUES ?";
                        dbConnection.query(insertInfo, [insertPlayListItemValues], async function (err, result) {
                          if (err) {
                            dbConnection.end();
                            res.send(JSON.stringify({ "status": 200, "error": err, "response": 'Issue while file importing', "success": false }));
                          } else { 
                           
                            console.log('Value Inserted Successfully!');
                            
                          }
                        });
                      }else{
                          console.log('No Changes Yet!');
                      }

                     insertPlayListItemValues = [];
                     recordArr = [];
                }

              console.log('Operatrion Complete.');
              res.send(JSON.stringify({ "status": 200, "error": error, "response": 'Data Import Complate.', "success": true }));
          }
      });
      // Get All playlist End

}

 async function getAllPlaylistItemRecord(playlistEtag,playlist_id,key){
  await new Promise((resolve) => {

    var dbConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: 'connect_fm',
        port: 3306
      });
      
      dbConnection.connect();

    var checkRecordQuery = "select etag from connect_fm_playlist_item where playlist_id = '"+playlist_id+"'";
    dbConnection.query(checkRecordQuery, async function (error, resultDataItem, fields) {
        if (error) {
            dbConnection.end();
        } else {
            // for(var i = 0; i < resultDataItem.length; i++){
            //     var etag = resultDataItem[i].etag;
            //     recordArr.push(etag);
            //     //await getAllPlaylistRecordArr(etag,playlist_id,key);
            // }
            for (const fileItem of resultDataItem) {
                var playlistItemEtag = fileItem.etag;
                await getAllPlaylistRecordArr(playlistItemEtag);
            }
            console.log('recordArr playlist id : '+playlist_id);
            // console.log(recordArr);
            var nextPageToken = "";
            await getAllPlaylistRecord(playlistEtag,playlist_id,key,nextPageToken);
           
           // recordArr = [];
           resolve(console.log('Record Array made successfully'));
        }
    });
  });
 }


 async function getAllPlaylistRecordArr(playlistItemEtag){
    await new Promise((resolve) => {
      
      recordArr.push(playlistItemEtag);
      resolve();
    });
 }

 async function getAllPlaylistRecord(etag,playlist_id,key,nextPageToken){
    await new Promise((resolve) => {
      
        console.log('playlist_id : ' + playlist_id + ' Etags : ' + etag + 'Key : ' + key);
    
    // Get All Play List Item for the particular Playlist START

        youtube.playlistItems.list({
        key: key,
        part: 'id,snippet',
        playlistId: playlist_id,
        maxResults: 100,
        pageToken: nextPageToken != "" ? nextPageToken : nextPageToken,
        }, (err, results) => {
         //   console.log(err ? err.message : results.data.items);
            var items = results.data.items;
            
            if(typeof results.data.nextPageToken === 'undefined') {
                nextPageToken = "";
            }else{
                nextPageToken = results.data.nextPageToken;
            }

            console.log("nextPageToken : "+nextPageToken);

            console.log('Total Item Each Record : '+items.length);

            items.forEach(function(element) 
              { 
                var ItemEtag = element.etag;
                var snippet = element.snippet;
                var title = snippet.title;
                var channelTitle = snippet.channelTitle;
                var channelId = snippet.channelId;
                var playlistId = playlist_id;
                var playlistItemId = element.id;
                var publishedAt = snippet.publishedAt;

                var thumbnails = snippet.thumbnails;

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

                var resourceId = snippet.resourceId;
                var videoId = resourceId.videoId;

                if(recordArr.indexOf(ItemEtag) !== -1){
                    console.log("Value exists!")
                } else{
                    console.log('Value does not exist.');
                    var dataValue = [];
                    dataValue.push(ItemEtag);
                    dataValue.push(title);
                    dataValue.push(channelTitle);
                    dataValue.push(channelId);
                    dataValue.push(playlistId);
                    dataValue.push(playlistItemId);
                    dataValue.push(publishedAt);
                    dataValue.push(thumbnail_medium);
                    dataValue.push(thumbnail_high);
                    dataValue.push(videoId);
                    insertPlayListItemValues.push(dataValue);
                }

              });

              if(nextPageToken == ""){
                resolve(console.log('Insert array made successfully'));
              }else{
                  console.log('Recurtion');
                  getAllPlaylistRecord(etag,playlist_id,key,nextPageToken);
                  resolve(console.log('Insert array made successfully 1'));
              }
              
        });

    // Get All Play List Item for the particular Playlist END

      
    });
}

router.get('/', async function (req, res) {
    await insertPlaylistItem(req, res);
});
   
 
 module.exports = router;
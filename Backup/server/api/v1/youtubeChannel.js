var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');

var arr = [];
/* POST api to save search telemetry*/
router.get('/',async function (req, res, next) {
    arr = [];
    var dbName = req.headers.db_name;

    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);

        var selectQuery = "SELECT title,playlist_id FROM connect_fm_playlist order by published_at desc";
        onestation.query(selectQuery,async function (err, result) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response":err,"message :": "Error while getting playlist records", "success": false }));
                onestation.end();
            } else {
                var title = "";
                var playlist_id = "";
                for (const fileItem of result) {
                    title = fileItem.title;
                    playlist_id = fileItem.playlist_id;
                    await getYoutubePlaylist(title,playlist_id,dbName);
                }
                res.send(JSON.stringify({ "status": 200, "error": null, "response":arr,"message :": "Data successfully fetch", "success": true }));
                onestation.end();
            }
        });
    }
});

async function getYoutubePlaylist(title,playlist_id,dbName){

    await new Promise((resolve) => {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName); 

        var selectQuery = "SELECT * FROM connect_fm_playlist_item where playlist_id = '"+playlist_id+"' order by published_at desc";
        onestation.query(selectQuery,async function (err, resultPlaylistItem) {
            if (err) {
                res.send(JSON.stringify({ "status": 500, "error": err, "response":err,"message :": "Error while playlist Item records", "success": false }));
                onestation.end();
            } else {
                var arr1 = {};
                arr1['channel_name'] = title;
                arr1['songs'] = resultPlaylistItem;
                arr.push(arr1);
                onestation.end();
                resolve(console.log("get Youtube playlist"));
            }
        });
    });
}

module.exports = router;

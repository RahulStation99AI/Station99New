var express = require('express');
var router = express.Router();
var dbConfig=require('../../dbconfig');
/* get config api*/
router.get('/', function (req, res, next) {
    let isStationExist = "SELECT * FROM radiostation WHERE station_id=" + req.headers.radio_station_id;

    var univConnection = mysql.createConnection({
        host: dbConfig.hostname,
        user: dbConfig.username,
        password: dbConfig.password,
        database: "univ",
        port: 3306
    });
    univConnection.connect();


    univConnection.query(isStationExist, (error, result, fields) => {
        if (error) {
            res.send(JSON.stringify({ "status": 500, "error": error, "response": result }));
        } else {
            var data = result[0];
            // var images = ["item1", "item2"];
            // var tabs = { item1: "item1val", item2: "item2val" };
            // var resp={ otherArray,otherObject};
            var resp = {
                "station_id": 57,
                "station_name": "krko",
                "images": [{
                    "station_logo_small": "",
                    "station_logo_big": "",
                    "home_bg": "",
                    "playlist_bg": "",
                    "radio_ad_bg": "",
                    "special_ad_bg": ""
                }],

                "station_email": "",
                "station_phone": "",
                "station_website": "",
                "station_address1": "",
                "station_address2": "",
                "station_city": "",
                "station_country": "",
                "station_state": "",
                "station_zipcode": 512617,
                "base_url": "",
                "google_key": "",
                "fb_key": "",
                "google_link": "",
                "fb_link": "",
                "font": [{
                    "header_font_color": "",
                    "sub_header_font_color": "",
                    "meta_header_font_color": ""
                }],
                "tabs": [{
                    "tab_home_name": "",
                    "tab_home_image": "",
                    "tab_playlist_name": "",
                    "tab_playlist_image": "",
                    "tab_radio_name": "",
                    "tab_radio_image": "",
                    "tab_special_name": "",
                    "tab_special_image": "",
                    "tab_selected_color": "",
                    "tab_unselected_color": ""
                }],
                "rate_app_on_playstore": 1,
                "contact_us": [{
                    "link": "",
                    "status": 1,
                    "force_update": 0
                }],
                "privacy": [{
                    "link": "",
                    "status": 1,
                    "force_update": 0
                }],
                "termscondition": [{
                    "link": "",
                    "status": 1,
                    "force_update": 0
                }]
            };
            res.send(JSON.stringify({ "status": 200, "error": null, "response": resp, "success": true }));
        }
    });
});

module.exports = router;
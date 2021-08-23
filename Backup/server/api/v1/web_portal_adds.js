var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


router.get('/', function (req, res) {

    //var id = req.params.airdate;

    var radioAdsPromise = new Promise(function (resolve, reject) {
        let radioAds = [];
        connection.query('select * from campaigninfo where IsRadioAd = 1', function (error, results, fields) {
            if (!error && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    radioAds.push(results[i]);
                }
                resolve(radioAds);
            }
        });
    });

    var homeAds = new Promise(function (resolve, reject) {
        let radioAds = [];
        connection.query('select * from campaigninfo where IsRadioAd = 1', function (error, results, fields) {
            if (!error && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    radioAds.push(results[i]);
                }
                resolve(radioAds);
            }
        });
    });
    var specialAds = new Promise(function (resolve, reject) {
        let radioAds = [];
        connection.query('select * from campaigninfo where IsRadioAd = 1', function (error, results, fields) {
            if (!error && results.length > 0) {
                for (var i = 0; i < results.length; i++) {
                    radioAds.push(results[i]);
                }
                resolve(radioAds);
            }
        });
    });
    var getAllTpesOfAds = new Promise(function (resolve, reject) {
        radioAdsPromise.then(function (_radioAds) {
            homeAds.then(function (_homeAdsList) {
                specialAds.then(function (_specialAds) {
                    resolve({
                        home_ads: _homeAdsList,
                        radio_ads: _radioAds,
                        _specialAds: _specialAds
                    })
                })
            });
        });
    });

    getAllTpesOfAds.then(function (allAds) {
        res.send(JSON.stringify({ "status": 200, "error": null, "response": allAds }))
    });
    
});
module.exports = router;
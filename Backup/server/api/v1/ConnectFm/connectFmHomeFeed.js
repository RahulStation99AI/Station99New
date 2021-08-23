var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('../GlobalDBHelper.js');
var jwt = require('jsonwebtoken');


/* POST login with req body */
router.get('/', function (req, res, next) {

    var selectQuery = `call proc_get_connect_fm_home_feed()`;
    var dbName = req.headers.db_name;
    
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        onestation.query(selectQuery, (error, resultData, fields) => {
           
            if (error) {
                // res.send(JSON.stringify({ "status": 500, "error": error, "response": null }));
                res.send(JSON.stringify({ "status": 500, "error": error, "response":resultData,"message": "success", "success": false }));
                onestation.end();
            } else {
                var resData = resultData[0];
                res.send(JSON.stringify({ "status": 200, "error": error, "response":resData,"message": "success", "success": true }));
            }
        });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
    }
});

module.exports = router;
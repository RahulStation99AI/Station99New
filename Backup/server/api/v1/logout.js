var express = require('express');
var router = express.Router();
var { GlobalDBHelper } = require('./GlobalDBHelper.js');


/* POST logout req body */
router.post('/', function (req, res, next) {
   
    var dbName = req.headers.db_name;
    if (dbName != null) {
        var helper = new GlobalDBHelper(dbName);
        var onestation = helper.getConnection(dbName);
        
             // Update User Logout Field Query
            var userQuery = "update users set is_login = '0' where user_id = ?";
            var userData = [[req.body.user_id]];
            onestation.query(userQuery, [userData], function (err, result) {
                if (err) {
                    res.send(JSON.stringify({ "status": 500, "error": err, "response": { "status": 0, "message": "", "result": result }, "success": false }));
                    onestation.end();
                }else{
                    res.send(JSON.stringify({ "status": 200, "error": null, "response":result , "success": true, "message :": "You have successfully logged out"  }));
                    onestation.end();
                }
            });
    } else {
        res.send(JSON.stringify({ "status": 500, "error": "Invalid requent sent", "response": [], "success": false }));
    }
});


module.exports = router;
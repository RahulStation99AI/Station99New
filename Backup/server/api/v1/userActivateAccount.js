var express = require('express');
var router = express.Router();
var path = require('path');

// Get Terms & conditions
router.get('/',function(req,res){
  //console.log(path.join("inside" + __dirname+'/api/v1/terms-and-condition.html'));
    res.sendFile(path.join(__dirname+'/user-activate-account.html'));
    //__dirname : It will resolve to your project folder.
  });

module.exports = router;
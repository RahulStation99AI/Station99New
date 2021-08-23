const { verify } = require('jsonwebtoken');

module.exports = {
    checkToken: (req,res,next) => {
        let token = req.get('authorization');
        
        if(token){
            token = token.slice(7);
            verify(token, 'station99', function(err, decoded) {
            
                if(err){
                    res.json({
                        success:0,
                        message:"Invalid Token"
                    });
                }else{
                    console.log('kash');
                    console.log(next);
                    next();
                    console.log('vikash');
                }
    
            }); 
        }else{
            res.json({
                success:0,
                message:"Access denied! unauthourized user "
            });
        }
    }
}
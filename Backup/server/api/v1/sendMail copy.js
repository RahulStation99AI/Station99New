
var nodemailer = require('nodemailer');
var functionSendMail = function(title,msg){
		
    return new Promise(resolve => {
        let transport = nodemailer.createTransport({
            host: 'station99ai.com',
			port: 465,
			auth: {
				user: 'support@station99ai.com',
				pass: 'Station99@Support@I'
			}
        });

        const message = {
            from: 'support@station99ai.com', // Sender address
            to: 'manishgupta1890@gmail.com',         // List of recipients
            subject: title+' Production New API Test', // Subject line
            html: '<p>'+msg+'</p>' // Plain text body
        };

        transport.sendMail(message, function(err, info) {
            if (err) {
                console.log(err);
                resolve('Error while sending mail');
            } else {
                console.log(info);
                resolve('Success Mail has been send');
            }
        });
    });
}

var asyncCall = async function asyncCall(title,msg) {
    var result = await functionSendMail(title,msg);
    console.log(result);
}

module.exports = asyncCall;
var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
/* POST user with req body */ 

	var functionSendMail = function(){
		
		return new Promise(resolve => {
			/*let transport = nodemailer.createTransport({
				host: 'sendmail4.brinkster.com',
				port: 2525,
				auth: {
				user: 'admin@rstrings.com',
				pass: 'admin4rstrings'
				}*/
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
				subject: 'Design Your Model S | Tesla', // Subject line
				html: '<p>Have the <b>most fun </b>you can in a car. Get your Tesla today!</p>' // Plain text body
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
	  
	async function asyncCall() {
		console.log('calling');
		var result = await functionSendMail();
		console.log(result);
		// expected output: 'resolved'
	}
	
	router.post('/', function (req, res, next) {
		console.log('send email script');
		asyncCall();
	});


module.exports = router;

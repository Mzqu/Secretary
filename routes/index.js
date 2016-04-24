var express = require('express');
var router = express.Router();
var BCBot = require('BCBot');
var utils = require('../util.js');
var builder = require('botbuilder');
var twilio = require('twilio');

var model = 'https://api.projectoxford.ai/luis/v1/application?id=f86def56-4901-4874-89c1-19f43e9e7d9d&subscription-key=9b8a3f03610f4c5aa8f07e1b31664d27';
var bot = new BCBot(model, 'TextBot');
var twilioMessage = '';
var cortanaBot = bot.bot;
var dialog = bot.dialog;
var finished = false;
cortanaBot.add('/', dialog);

bot.addCommand(new utils.BotCommandFactory('set temperature', [
	function(session, args, next) {
		if (builder.EntityRecognizer.findEntity(args.entities, 'thermometer::target temperature') || builder.EntityRecognizer.findEntity(args.entities, 'filefolder::name')) {
			twilioMessage = JSON.stringify(args.entities);
			finished = true;
			session.send("lmao");
		} else {
			session.send("no entities found");
		}
	},
	function(session, results, next) {
		next();
	},
	function(session, results) {
		session.send('Ok... no problem.');
	}
]));
bot.addCommand(new utils.BotCommandFactory('texting'), [
  function(session, args, next) {
    if (builder.EntityRecognizer.findEntity(args.entities, 'responseMessage')) {
      twilioMessage = JSON.stringify(args.entities);
      finished = true;
      session.send("lmao");
    } else {
      session.send("no entity found");
    }
  },
  function (session, results, next) {
    next();
  },
  function (session, results) {
    session.send("???");
  }
]);
bot.addCommand(new utils.BotCommandFactory('calling'), [
  function(session, args, next) {
    if (builder.EntityRecognizer.findEntity(args.entities, 'responseMessage')) {
      twilioMessage = JSON.stringify(args.entities);
      finished = true;
      session.send("lmao");
    } else {
      session.send("no entity found");
    }
  },
  function (session, results, next) {
    next();
  },
  function (session, results) {
    session.send("???");
  }
]);
bot.setDefault(new utils.BotDefaultCommandFactory(builder.DialogAction.send("I'm sorry I didn't understand. I can only create and delete alarms.")));

router.get('/', function(req, res) {
	var twiml = new twilio.TwimlResponse();
	if (req.query.Body == 'hello') {
		twiml.message('Hi!');
	} else if (req.query.Body == 'bye') {
		twiml.message('Goodbye');
	} else {
		twiml.message('No Body param match, Twilio sends this in the request to your server.');
	}
	res.writeHead(200, {
		'Content-Type': 'text/xml'
	});
	res.end(twiml.toString());
});

router.post('/', function(req, res) {
	var twiml = new twilio.TwimlResponse();
	console.log(req.body.From);
	cortanaBot.processMessage({
		text: req.body.Body || ''
	});
	var testerino = setInterval(function() {
		console.log("running");
		if (finished == true) {
      var json = JSON.parse(twilioMessage);
			console.log("finished");
			finished = !finished;
			console.log(twilioMessage);
      twiml.message(smsManager(twilioMessage));
			if (json[0].type == 'texting') {
        console.log("actally in the if");
				const spawn = require('child_process').spawn;
				const sleep = spawn('sleep', [json[0].entity]);
				sleep.on('close', function() {
					sendSMS(req.body.From, 'alarm up!');
				});
			}
			res.writeHead(200, {
				'Content-Type': 'text/xml'
			});
			res.end(twiml.toString());
			clearInterval(testerino);
		}
	}, 100);
});

function smsManager(message) {
	var json = JSON.parse(message);
	if (json.type = "thermometer") {
		return "Setting thermometer temperature to " + json[0].entity;
	} else if (json.type = "texting") {
		return "not implemented";
	} else if (json.type = "calling") {
    return "not implemented";
  } else {
		return message;
	}
}

function sendSMS(number, message) {
  var client = new twilio.RestClient('AC5d7b89f30b59ca831b99b3d25b8e6052', '54f8c1ce63f2c5f0d15c7834958c65f4');

  // Pass in parameters to the REST API using an object literal notation. The
  // REST client will handle authentication and response serialzation for you.
  client.sendSms({
      to:number,
      from:'+18312186678',
      body:message
  }, function(error, message) {
      // The HTTP request to Twilio will run asynchronously. This callback
      // function will be called when a response is received from Twilio
      // The "error" variable will contain error information, if any.
      // If the request was successful, this value will be "falsy"
      if (!error) {
          // The second argument to the callback will contain the information
          // sent back by Twilio for the request. In this case, it is the
          // information about the text messsage you just sent:
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);

          console.log('Message sent on:');
          console.log(message.dateCreated);
      } else {
          console.log('Oops! There was an error.');
      }
  });
}
// router.post('/api/messages', bot.verifyBotFramework(), bot.listen());

module.exports = router;

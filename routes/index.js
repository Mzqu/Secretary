var express = require('express');
var router = express.Router();
var BCBot = require('BCBot');
var utils = require('../util.js');
var builder = require('botbuilder');
var twilio = require('twilio');

var model = 'https://api.projectoxford.ai/luis/v1/application?id=33892828-8dde-4383-9efa-8d4246fc5a2c&subscription-key=9b8a3f03610f4c5aa8f07e1b31664d27';
var bot = new BCBot(model, 'TextBot');
var twilioMessage = '';
var cortanaBot = bot.bot;
var dialog = bot.dialog;
var finished = false;
var callbackGlobal;
cortanaBot.add('/', dialog);

bot.addCommand(new utils.BotCommandFactory('set temperature', [
	function(session, args, next) {
		if (builder.EntityRecognizer.findEntity(args.entities, 'builtin.temperature')) {
			twilioMessage = JSON.stringify(args.entities);
			finished = true;
			session.send("lmao");
		} else {
      finished = true;
			session.send("no entities found");
		}
    callbackGlobal("temperature");
	},
	function(session, results, next) {
		next();
	},
	function(session, results) {
		session.send('Ok... no problem.');
	}
]));
bot.addCommand(new utils.BotCommandFactory('texting', [
  function(session, args, next) {
    if (builder.EntityRecognizer.findEntity(args.entities, 'texting')) {
      twilioMessage = JSON.stringify(args.entities);
      finished = true;
      session.send("lmao");
    } else {
      finished = true;
      session.send("no entity found");
    }
    callbackGlobal("texting");
  },
  function (session, results, next) {
    next();
  },
  function (session, results) {
    session.send("???");
  }
]));
bot.addCommand(new utils.BotCommandFactory('calling', [
  function(session, args, next) {
    if (builder.EntityRecognizer.findEntity(args.entities, 'calling')) {
      twilioMessage = JSON.stringify(args.entities);
      finished = true;
      session.send("lmao");
    } else {
      finished = true;
      session.send("no entity found");
    }
    callbackGlobal("calling");
  },
  function (session, results, next) {
    next();
  },
  function (session, results) {
    session.send("???");
  }
]));
bot.setDefault(new utils.BotDefaultCommandFactory(function() {
  builder.DialogAction.send("I'm sorry I didn't understand. I can only create and delete alarms.");
  finished = true;
  callbackGlobal("idk");
}));

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
  if (req.body.Body.substring(0, 5).toLowerCase() == "open ") {
    var exec = require('child_process').exec;
    var child = exec('open -a "' + req.body.Body.substring(5, req.body.Body.length) + '"', function (error, stdout, stderr) {
      if (error == null) {
        sendSMS(req.body.From, "Opened " + req.body.Body.substring(5, req.body.Body.length));
      } else {
        sendSMS(req.body.From, "Error opening " + req.body.Body.substring(5, req.body.Body.length));
      }
    });
  } else if (req.body.Body.substring(0, 5).toLowerCase() == "exit ") {
    console.log("exit");
    var exec = require('child_process').exec;
    var child = exec("ps -ax | awk '/[" + req.body.Body.charAt(5) + "]" + req.body.Body.substring(6, req.body.Body.length) + "/{print $1}'", function (error, stdout, stderr) {
      var allProcesses = stdout.split('\n');
      console.log(allProcesses);
      for (var i = 0; i < allProcesses.length - 1; i++) {
        console.log(allProcesses[i]);
        var child2 = exec("kill " + allProcesses[i], function (e, o, se) {
          if (e == null) {
            sendSMS(req.body.From, "Exited " + req.body.Body.substring(5, req.body.Body.length));
          } else {
            sendSMS(req.body.From, "Error exiting " + req.body.Body.substring(5, req.body.Body.length));
          }
        });
      }
    });
  } else if (req.body.Body.toLowerCase() == "sleep") {
    var exec = require('child_process').exec;
    var child = exec('pmset sleepnow', function (e, o, se) {
      if (e == null) {
        sendSMS(req.body.From, "Put computer to sleep.");
      } else {
        sendSMS(req.body.From, "Error putting computer to sleep.");
      }
    });
  } else {
  	cortanaBot.processMessage({
  		text: req.body.Body || ''
  	});
    function callbackerino(intent) {
  		console.log("running");
      try {
        var json = JSON.parse(twilioMessage);
  			console.log(json);
  			finished = !finished;
  			console.log(twilioMessage);
        twiml.message(smsManager(twilioMessage));
  			if (intent == "texting") {
  				var spawn = require('child_process').spawn;
  				var sleep = spawn('sleep', [parseTime(json[1].resolution.duration)]);
  				sleep.on('close', function() {
  					sendSMS(req.body.From, json[0].entity);
  				});
  			} else if (intent == "calling") {
          var spawn = require('child_process').spawn;
  				var sleep = spawn('sleep', [parseTime(json[1].resolution.duration)]);
  				sleep.on('close', function() {
  					sendSMS(req.body.From, json[0].entity);
  				});
        }
  			res.writeHead(200, {
  				'Content-Type': 'text/xml'
  			});
  			res.end(twiml.toString());
      } catch (e) {
        console.log(e.message);
        sendSMS(req.body.From, "Command not recognized.");
      } finally {
			  // clearInterval(testerino);
        twilioMessage = "";
      }
  	}
    callbackGlobal = callbackerino;
  }
});

function parseTime(time) {
  var matches = time.substring(2, time.length).match(/[a-zA-Z]+|[0-9]+/g);
  var seconds = 0;
  for (var i = 0; i < matches.length; i++) {
      if (matches[i + 1] == "H") {
        seconds += matches[i] * 60 * 60;
        i++;
      } else if (matches[i + 1] == "M") {
        seconds += matches[i] * 60;
        i++;
      } else {
        seconds += matches[i] * 1;
        return seconds;
      }
  }
  return seconds;
}

function smsManager(message) {
	var json = JSON.parse(message);
	if (json[0].type == "builtin.temperature") {
		return "Setting thermometer temperature to " + json[0].entity;
	} else if (json[0].type == "texting") {
		return "Got it! Texting you in " + json[1].resolution.duration;
	} else if (json[0].type == "calling") {
    return "Got it! Calling you in " + json[1].resolution.duration;
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

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
var cylon = require('CylonNest');
cortanaBot.add('/', dialog);

bot.addCommand(new utils.BotCommandFactory('check', [
  function(session, args, next) {
		console.log(JSON.stringify(args.entities));
    twilioMessage = JSON.stringify(args.entities);
    callbackGlobal("check");
  },
  function (session, results, next) {
    next();
  },
  function (session, results) {
    session.send("???");
  }
]));

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
    console.log('TEXTING');
    console.log(args.entities);
    if (builder.EntityRecognizer.findEntity(args.entities, 'sentMessage')) {
      console.log('TEXTING 2');
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
bot.addCommand(new utils.BotCommandFactory('calculate', [
  function(session, args, next) {
		console.log("OPERATION");
    twilioMessage = JSON.stringify(args.entities);
    callbackGlobal("calculate");
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
  if (req.body.From == "+14084443301") {
	if (req.body.Body.toLowerCase() == "secretary") {
		introduction(req);
	} else if (req.body.Body.substring(0, 5).toLowerCase() == "open ") {
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
  } else if (req.body.Body.substring(0, 5).toLowerCase() == "sleep") {
    var exec = require('child_process').exec;
    var child = exec('pmset sleepnow', function (e, o, se) {
      if (e == null) {
        sendSMS(req.body.From, "Put computer to sleep.");
      } else {
        sendSMS(req.body.From, "Error putting computer to sleep.");
      }
    });
  } else if (req.body.Body.substring(0, 4).toLowerCase() == "lock") {
		var exec = require('child_process').exec;
    var child = exec('/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend', function (e, o, se) {
      if (e == null) {
        sendSMS(req.body.From, "Locked computer.");
      } else {
        sendSMS(req.body.From, "Error locking computer");
      }
    });
	} else {
  	cortanaBot.processMessage({
  		text: req.body.Body || ''
  	});
    function callbackerino(intent) {
      var twiml = new twilio.TwimlResponse();
  		console.log("running");
      try {
        var json = JSON.parse(twilioMessage);
  			console.log(json);
  			finished = !finished;
				if (intent == "calculate") {
					var symbols = [];
					var numbers = [];
					for (var i = 0; i < json.length; i++) {
							if (json[i].type == "sign") {
								symbols.push(json[i].entity);
							} else if (json[i].type == "builtin.number"){
								numbers.push(json[i].entity);
							}
					}
					var result = "";
					for (var i = 0; i < symbols.length; i++) {
							result += numbers[i] + symbols[i];
					}
					result += numbers[symbols.length];
					console.log(result);

					twiml.message(eval(result) + "");
				} else if (intent == "texting") {
  				var spawn = require('child_process').spawn;
					var datetime = -1;
					var sentMessage = -1;
					for (var i = 0; i < json.length; i++) {
						if (json[i].type == "builtin.datetime.duration") {
								datetime = i;
						} else if (json[i].type == "sentMessage") {
							sentMessage = i;
						}
					}
          if (datetime != -1) {
						twiml.message(smsManager(twilioMessage, intent, datetime));
            var sleep = spawn('sleep', [parseTime(json[datetime].resolution.duration)]);
  				  sleep.on('close', function() {
  					    sendSMS(req.body.From, json[sentMessage].entity);
  				      });
            } else {
							twiml.message(smsManager(twilioMessage, intent));
						}
  			} else if (intent == "check") {
          if (json[0].entity == "temperature") {
            cylon.start();
            sendSMS(req.body.From, "Checking temperature...");
            var waitTimer = setInterval(function() {
              if (cylon.temp) {
                console.log(cylon.temp);
                sendSMS(req.body.From, cylon.temp);
                clearInterval(waitTimer);
              }
            }, 100);
          }
        } else {
          twiml.message(smsManager(twilioMessage, intent));
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
}
});

function introduction(req) {
	intro1(req);
}

function intro1(req) {
	sendSMS(req.body.From, "Hi! I'm Secretary, your very own virtual SMS-based assistant!", intro2, req);
}

function intro2(req) {
	sendSMS(req.body.From, "I can open and exit applications, set the thermostat, remind you of messages, perform basic math, and more!");
}

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

function smsManager(message, intent, index) {
	index = index || 0;
	var json = JSON.parse(message);
	if (intent == "temperature") {
		return "Setting thermostat temperature to " + json[0].entity;
	} else if (intent == "texting" && json[index].type == "builtin.datetime.duration") {
		return "Got it! Texting you in " + json[index].resolution.duration.substring(2, json[index].resolution.duration.length);
	} else if (intent == "texting") {
    return "Please use 'later' instead of 'in' (i.e. 1 minute later vs. in 1 minute)";
  } else {
		return message;
	}
}

function secondsToDuration(seconds) {
  var hours = Math.floor(seconds/3600);
  var remainder = seconds % 3600;
  var minutes = Math.floor(remainder/60);
  remainder = Math.ceil(remainder % 60);
  var result = "";
  if (hours != 0) {
    result += hours + "H";
  }
  if (minutes != 0) {
    result += minutes + "M";
  }
  if (seconds != 0) {
    result += remainder + "S";
  }
  return result;
}

function sendSMS(number, message, callback, req) {
  var client = new twilio.RestClient('AC5d7b89f30b59ca831b99b3d25b8e6052', '54f8c1ce63f2c5f0d15c7834958c65f4');
	callback = callback || null;
	req = req || null;

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
					if (callback != null && req != null) {
						callback(req);
					}
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

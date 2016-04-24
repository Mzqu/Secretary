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
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        // var location = builder.EntityRecognizer.findEntity(args.entities, 'location');
        //
        // // Prompt for title
        // if (!location) {
        //     builder.Prompts.text(session, 'Where do you want to make it?');
        // } else {
        //     next();
        // }
        if (builder.EntityRecognizer.findEntity(args.entities, 'thermometer::target temperature') || builder.EntityRecognizer.findEntity(args.entities, 'filefolder::name')) {
          // if (builder.EntityRecognizer.findEntity(args.entities, 'filefolder::location'))
            // session.send(builder.EntityRecognizer.findEntity(args.entities, 'filefolder::location'));
          // if (builder.EntityRecognizer.findEntity(args.entities, 'filefolder::name'))
          //   session.send(builder.EntityRecognizer.findEntity(args.entities, 'filefolder::name'));
          // session.send(args.entities[0].entity);
          twilioMessage = JSON.stringify(args.entities);
          finished = true;
          session.send("lmao");
        } else {
          session.send("no entities found");
        }
    },
    function (session, results, next) {
        /*var alarm = session.dialogData.alarm;
        if (results.response) {
            alarm.title = results.response;
        }

        // Prompt for time (title will be blank if the user said cancel)
        if (alarm.title && !alarm.timestamp) {
            builder.Prompts.time(session, 'What time would you like to set the alarm for?');
        } else {*/
            next();
        //}
    },
    function (session, results) {
        /*var alarm = session.dialogData.alarm;
        if (results.response) {
            var time = builder.EntityRecognizer.resolveTime([results.response]);
            alarm.timestamp = time ? time.getTime() : null;
        }

        // Set the alarm (if title or timestamp is blank the user said cancel)
        if (alarm.title && alarm.timestamp) {
            // Save address of who to notify and write to scheduler.
            alarm.to = session.message.from;
            alarm.from = session.message.to;
            alarms[alarm.title] = alarm;

            // Send confirmation to user
            var date = new Date(alarm.timestamp);
            var isAM = date.getHours() < 12;
            session.send('Creating alarm named "%s" for %d/%d/%d %d:%02d%s',
                alarm.title,
                date.getMonth() + 1, date.getDate(), date.getFullYear(),
                isAM ? date.getHours() : date.getHours() - 12, date.getMinutes(), isAM ? 'am' : 'pm');
        } else {*/
            session.send('Ok... no problem.');
        //}
    }
]));

bot.setDefault(new utils.BotDefaultCommandFactory(builder.DialogAction.send("I'm sorry I didn't understand. I can only create and delete alarms.")));

router.get('/', function(req, res) {
    var twiml = new twilio.TwimlResponse();
    if (req.query.Body == 'hello') {
        twiml.message('Hi!');
    } else if(req.query.Body == 'bye') {
        twiml.message('Goodbye');
    } else {
        twiml.message('No Body param match, Twilio sends this in the request to your server.');
    }
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

router.post('/', function(req, res) {
    var twiml = new twilio.TwimlResponse();
    console.log(req.body.Body);
    cortanaBot.processMessage({ text: req.body.Body || '' });
    var testerino = setInterval(function() {
      console.log("running");
      if (finished == true) {
        console.log("finished");
        finished = !finished;
        console.log(twilioMessage);
        twiml.message(smsManager(twilioMessage));
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        clearInterval(testerino);
      }
    }, 100);
});

function smsManager(message) {
  var json = JSON.parse(message);
  if (json.type = "thermometer") {
    return "Setting thermometer temperature to " + json.entity;
  } else if (json.type = "alarm") {
    return "not implemented";
  } else {
    return message;
  }
}
// router.post('/api/messages', bot.verifyBotFramework(), bot.listen());

module.exports = router;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

//Chatbot stuff
//var restify = require('restify');
//var builder = require('botbuilder');
//Create bot, add dialogs
//var bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
/*
//this doesn't seem to work, ignore for now-----//
var helloBot = new builder.TextBot();           //
helloBot.add('/', function (session) {          //
  session.send('feeeeed');                      //
});                                             //
helloBot.listenStdin();                         //
//----------------------------------------------//

bot.add('/', function (session) {
  session.send('Hello World');
});
//var restify_server = restify.createServer();
//restify_server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
//restify_server.listen(process.env.port || 3978, function () {
//  console.log('%s listening to %s', restify_server.name, restify_server.url);
//});
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

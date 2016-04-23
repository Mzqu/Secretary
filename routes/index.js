var express = require('express');
var router = express.Router();
var bot = require('BCBot');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.post('/api/messages', bot.verifyBotFramework(), bot.listen());
console.log(bot);
// router.post('/api/messages', bot.verifyBotFramework(), bot.listen());

module.exports = router;

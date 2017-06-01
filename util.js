function throwIncorrectFactoryError() {
	throw new Error("Incorrect factory type found.");
}

function throwIncorrectBotTypeError() {
	throw new Error("Incorrect bot type found.");
}

function Extendable() {}
Extendable.prototype.extend = function(func, code) {
	this[func] = code;
};

var BotCommandFactory = function(intent, action) {
	this.getIntent = function() {
		return intent;
	};
	this.getAction = function() {
		return action;
	};
	this.getType = function() {
		return "BotCommandFactory";
	};
};

var BotDefaultCommandFactory = function(action) {
	this.getAction = function() {
		return action;
	};
	this.getType = function() {
		return "BotDefaultCommandFactory";
	};
};

exports.throwIncorrectFactoryError = throwIncorrectFactoryError;
exports.Extendable = Extendable;
exports.BotCommandFactory = BotCommandFactory;
exports.BotDefaultCommandFactory = BotDefaultCommandFactory;
exports.throwIncorrectBotTypeError = throwIncorrectBotTypeError;

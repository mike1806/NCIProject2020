var mongoose = require("mongoose");
var PassportMongoose = require("passport-local-mongoose");


var logSchema = new mongoose.Schema({
	user: String,
	password: String,
});

logSchema.plugin(PassportMongoose);

module.exports = mongoose.model("Log", logSchema);
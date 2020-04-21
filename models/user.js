var mongoose = require("mongoose");
var PassportMongoose = require("passport-local-mongoose");


var profileSchema = new mongoose.Schema({
	user: String,
	password: String,
	isAdmin: {type: Boolean, default: false},
	name: String,
	surname: String,
	email: String,
	avatar: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
});

profileSchema.plugin(PassportMongoose);

module.exports = mongoose.model("User", profileSchema);
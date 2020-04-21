var mongoose = require("mongoose");

var commentsSchema = new mongoose.Schema({
	text: String,
	createdAt: {
		type: Date, 
		default: Date.now
	},
	image: String,
	author: {
		id: {
			//getting user from databases who wrote comment
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

module.exports = mongoose.model("Comment", commentsSchema);
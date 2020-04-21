var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({
   
    item: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    info: {
        type: String,
        required: true
    },
	createdAt: {
		type: Date, 
		default: Date.now
	},
    category: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }
    
});

var Product = module.exports = mongoose.model('Product', ProductSchema);


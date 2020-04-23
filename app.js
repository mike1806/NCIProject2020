var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Project = require("./models/komenty");
var passport = require("passport");
var LocalPlan = require("passport-local");
var martDB = require("./mart");
var Comment = require("./models/comments");
var User = require("./models/log");
var Override = require("method-override");
var flash = require("connect-flash");
var path = require("path");
//var Sklep = require("./models/shop");
var expressValidator = require("express-validator");
var fileUpload = require('express-fileupload');
var isImage = require('is-image');
var session = require('express-session');


var bieganieRoutes = require("./routes/bieganie");
var commentsRoutes = require("./routes/comments");
var authorizationRoutes = require("./routes/authorisation");
//var storeRoutes = require("./routes/admin_pages");


//mongoose.Promise = global.Promise;
//mongoose.connect('mongodb+srv://Mike:Pepsi123456@bieg-j6jhx.mongodb.net/test?retryWrites=true&w=majority', 
//{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}).then(function(err){
//	console.log("DB connected!");
//});

//shop settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(Override("_method"));
app.use(flash());
// Express fileUpload middleware
app.use(fileUpload());

// Get Category Model
var Category = require('./models/category');

//shop settings
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Set global errors variable
app.locals.errors = null;

//martDB();//populating manually db

//-------LOG SETTINGS-------

app.use(require("express-session")({
	secret: "Borkoś giurą",
	resave: false,
	saveUninitialized: false
}));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
}));


//express validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
	    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
				case '.gif':
                    return '.gif';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

app.get('*', function(req,res,next) {
   res.locals.list = req.session.list;
   res.locals.user = req.user || null;
   next();
});

//add flash messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.locals.moment = require("moment");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalPlan(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.message = req.flash("err");
	res.locals.move = req.flash("move");
	res.locals.extra = req.flash("extra");
	next();
});

var adminSites = require('./routes/c_p_sites.js');
var sites = require('./routes/site.js');
var adminCategories = require('./routes/c_p_types.js');
var adminProducts = require('./routes/c_p_items.js');
var items = require('./routes/items.js');
var list = require('./routes/list.js');


app.use('/start', sites);
app.use('/shop/admin/sites', adminSites);
app.use('/shop/admin/types', adminCategories);
app.use('/shop/admin/items', adminProducts);
app.use('/shop/items', items);
app.use('/shop/list', list);


app.use(bieganieRoutes);
app.use(commentsRoutes);
app.use(authorizationRoutes);
//app.use(storeRoutes);



app.listen(3000, "0.0.0.0", process.env.IP, function(){
console.log("Project server has been launched");
	});

//const { PORT=3000, LOCAL_ADDRESS='0.0.0.0' } = process.env

//app.listen(PORT, LOCAL_ADDRESS, () => {
 
//const address = app.address();
//console.log('server listening at', address);
//});

//console.log('server listening at', address);

//});


/*
Project.create({
	name: "Marek Grechut", 
	image: "https://pixabay.com/get/51e3d4464a54b108f5d084609620367d1c3ed9e04e50744171277ad59748c2_340.jpg",
	description: "Przybieżeli do Betlejem pas-te-że"
	},function(err, project){
	if(err){
		console.log(err);
	}else{
		console.log("nowe dzieło: ");
		console.log(project);
	}
			   
});

var bieganie = [
		{name: "Marek Grechuta", image: "https://pixabay.com/get/51e3d4464a54b108f5d084609620367d1c3ed9e04e50744171277ad59748c2_340.jpg"},
        {name: "Marek Szarik", image: "https://pixabay.com/get/57e2d1464c57a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},	
		{name: 'Mariusz Jop', image: "https://pixabay.com/get/57e7d04a4853a814f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Slavoj Zizek", image: "https://pixabay.com/get/54e4d3464e55a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Marek Grechuta", image: "https://pixabay.com/get/51e3d4464a54b108f5d084609620367d1c3ed9e04e50744171277ad59748c2_340.jpg"},
        {name: "Marek Szarik", image: "https://pixabay.com/get/57e2d1464c57a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},	
		{name: 'Mariusz Jop', image: "https://pixabay.com/get/57e7d04a4853a814f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Slavoj Zizek", image: "https://pixabay.com/get/54e4d3464e55a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Marek Grechuta", image: "https://pixabay.com/get/51e3d4464a54b108f5d084609620367d1c3ed9e04e50744171277ad59748c2_340.jpg"},
        {name: "Marek Szarik", image: "https://pixabay.com/get/57e2d1464c57a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},	
		{name: 'Mariusz Jop', image: "https://pixabay.com/get/57e7d04a4853a814f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Slavoj Zizek", image: "https://pixabay.com/get/54e4d3464e55a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Marek Grechuta", image: "https://pixabay.com/get/51e3d4464a54b108f5d084609620367d1c3ed9e04e50744171277ad59748c2_340.jpg"},
        {name: "Marek Szarik", image: "https://pixabay.com/get/57e2d1464c57a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},	
		{name: 'Mariusz Jop', image: "https://pixabay.com/get/57e7d04a4853a814f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"},
		{name: "Slavoj Zizek", image: "https://pixabay.com/get/54e4d3464e55a414f6da8c7dda793f7f1636dfe2564c704c7d2b73d5964dc05f_340.jpg"}
];

*/




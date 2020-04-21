var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

var Bieganie = require("../models/komenty");
var Comments = require("../models/comments");
var Author = require("../models/log");

//-------ROOT-------

router.get("/", function(req, res){
	res.render("landing");
});

//------ENDPOINT to collect JSON data for Android-----

router.get('/endpointUser', function (req, res) {
    User.find({}, function(err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong with Retrieving data');
    } else {
      // console.log(data[0]);
      res.json(data);
    }
  });

});

router.post('/endpointJsonUser', function(request, response) {
    response.write(request.body.user);
    response.end();
});


//-------AUTENTHICATION ROUTES-------

router.get("/registrar", function(req, res){
	res.render("registrar");
});

router.post("/registrar", function(req, res){
	var newUser = new User({
		username: req.body.username,
		name: req.body.name,
		surname: req.body.surname,
		email: req.body.email,
		avatar: req.body.avatar,
	});
	if(req.body.AdminPass === "pepsi12345"){
		req.flash({message: req.flash("extra", "Witaj " + User.user + ", adminie!")});
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash({message: req.flash("extra", "Coś poszło nie tak")});
			return res.render("registrar");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash({message: req.flash("extra", "Witaj " + user.username + ", stworzyłeś/stworzyłaś swój profil w serwisie Biegacz i Zwiedzacz!")});
			res.redirect("/bieganie");
		});
	});
});

//-----POST new USER via ANDROID-----*

const mongoClient = require('mongodb').MongoClient

const url = "mongodb+srv://Mike:Pepsi123456@bieg-j6jhx.mongodb.net/test?retryWrites=true&w=majority"


mongoClient.connect(url, (err, db) => {

    if (err) {
        console.log("Error while connecting mongo client")
    } else {

        const test = db.db('test')
        const collection = test.collection('users')

        router.post('/registrarAndroid', (req, res) => {

		var newUser = new User({
			username: req.body.username,
			name: req.body.name,
			surname: req.body.surname,
			email: req.body.email,
			avatar: req.body.avatar,
			});
			
		if(req.body.AdminPass === "pepsi12345"){
			newUser.isAdmin = true;
		}
			
		User.register(newUser, req.body.password, function(err, user){
			if(err){
			req.flash({message: req.flash("extra", "Coś poszło nie tak")});
			return (err);
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/registrarAndroid");
		});
	});;
					
			const query = { email: newUser.email }

            collection.findOne(query, (err, result) => {

                if (result == null) {
                    collection.insertOne(newUser, (err, result) => {
                        res.status(200).send()
                    })
                } else {
                    res.status(400).send()
                }
            })
       });
    }
});

//POST route for loggin-in

router.get("/login", function(req, res){
	res.render("login")
});

router.post("/login", passport.authenticate("local", 
	{
		 successRedirect: "/bieganie",
		 failureRedirect: "/login"
	}), function(req, res){
});


router.get("/logout", function(req, res){
	req.logout();
	req.flash('info', 'You are in log-out mode');
	res.redirect("/bieganie");
});

//-------PROFILE ROUTES-------
/*
router.get("/profile/:id", function(req, res) {
  User.findById(req.params.id, function(err, giveUser) {
    if(err) {
      req.flash("error", "Something went wrong.");
      return res.redirect("/");
    }
    Bieganie.find().where('author.id').equals(giveUser._id).exec(function(err, bieganie) {
      if(err) {
        req.flash("error", "Something went wrong.");
        return res.redirect("/");
      }
      res.render("profile/personal", {user: giveUser, bieganie: bieganie});
    })
  });
});
*/



function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("message", "Wylogowano prawidłowo");
	req.flash("move", "Musisz być zalogowany!");
	res.redirect("/login");
}


module.exports = router;

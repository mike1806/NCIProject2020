var express = require("express");
var router = express.Router();

var Project = require("../models/komenty");
var Comments = require("../models/comments");
var Author = require("../models/log");
var ObjectID


// testing endpoint to retrieve send data to Android Device

router.get('/endpoint', function (req, res) {
    res.json([
		{
        userId: 1,
    	id: 1,
    	title: "Sebastian:- Dla mnie to coś na zasadzie katharsiss. Jak nam firma stanęła przez pandemię, to trzeba było zwolnić parę osób. Ciężar przekazywania tej informacji spadł na mnie. Cholernie dołujące - opowiada.",
    	body: "Od początku kwietnia wolontariusz, który z własnej woli dał się zamknąć w Domu Pomocy Społecznej w Koszęcinie, który zmienił się w gigantyczne ognisko zakażeń koronawirusem."   
		}]);
});

// endpoint to retrieve all data from current projects


// INDEX ROUTE

router.get('/endpointProject', function (req, res) {
    Project.find({}, function(err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong with Retrieving data');
    } else {
      // console.log(data[0]);
      res.json(data);
    }
  });

});


router.get("/bieganie", function(req, res){
	
//get all projects from deep DB
	
	Project.find({}, function(err, projekty){
		if(err){
			console.log(err);
		} else {
			res.render("bieganie/bieganie", {bieganie: projekty, currentUser: req.user}); 
		}
	});
});

// POST CREATE ROUTE

router.post("/bieganie", function(req, res){
	
	//get data from input and add to bieganie array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username,
	}
	var newBieganie = {name: name, image: image, description: desc, author: author};
	 //create a new name + image and save to MongoDB
	Project.create(newBieganie, function(err, przebiezka){
		if(err){
			console.log(err);
			
		} else {
			//redirect to bieganie page
			res.redirect("/bieganie");
		}
	})
	
	//bieganie.push(newBiegaie); ==> old version
});

//POST route for ADDING new POST from Android
router.post("/bieganieAndroid", function(req, res){
	
	//get data from input and add to bieganie array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username,
	}
	
	var newBieganie = {name: name, image: image, description: desc}
	 //create a new name + image and save to MongoDB
	Project.create(newBieganie, function(err, przebiezka){
		if(err){
			console.log(err);
			
		} else {
			//redirect to bieganie page
			res.redirect("/bieganieAndroid");
		}
	})
	
	//bieganie.push(newBiegaie); ==> old version
});


//NEW ROUTE show form to create new bieganko

router.get("/bieganie/nowy", isLoggedIn, function(req, res){

res.render("bieganie/new");
});

//SHOW ROUTE

router.get("/bieganie/:id", function(req, res){

	Project.findById(req.params.id).populate("comments").exec(function(err, foundPost){
		if(err){
			console.log(err);
		} else {
			console.log(foundPost);
			res.render("bieganie/show", {bieganie: foundPost});
		}
	})
	
});

//EDIT POST

router.get("/bieganie/:id/edit", postOwner, function(req, res){
	Project.findById(req.params.id, function(err, checkBieganie){
		res.render("bieganie/edit", {bieganie: checkBieganie});
	});

});

//UPDATE POST

router.put("/bieganie/:id", postOwner, function(req, res){
	// find and update relevant post
	Project.findByIdAndUpdate(req.params.id, req.body.post, function(err, update){
		if(err){
			console.log(err);
			res.redirect("/bieganie");
		} else {
	//redirect
			res.redirect("/bieganie/" + update._id)
		}
	})
	
});

//DELETE POST

router.delete("/bieganie/:id", postOwner, function(req, res){
	Project.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/bieganie");
		} else {
			res.redirect("/bieganie");
		}
	});
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("message", "Musisz być zalogowany/zalogowana");
	res.redirect("/login");
}

function postOwner(req, res, next){
	if(req.isAuthenticated()){
		Project.findById(req.params.id, function(err, checkBieganie){
		if(err){
			req.flash("message", "Post nieodnaleziony");
			res.redirect("back");
		} else {
			//is that user`s post?
			if(checkBieganie.author.id.equals(req.user._id)|| req.user.isAdmin){
				next();
				} else {
					req.flash("message", "Nie masz uprawnień");
					res.redirect("back");
			}
		}
	});
	} else { 
		req.flash("message", "You must be an Admin to add post");
		res.redirect("back");
	}
}


module.exports = router;

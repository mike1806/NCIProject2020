var express = require("express");
var router = express.Router();

var Project = require("../models/komenty");
var Comment = require("../models/comments");
var Author = require("../models/log");

// -------COMMENTARIES ROUTES-----------

router.get("/bieganie/:id/comments/new", isLoggedIn, function(req, res){
	
	//find odpowiednie bieganie`s post by id
	Project.findById(req.params.id, function(err, bieganie){
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {bieganie: bieganie});

		}
	})
	
});

router.post("/bieganie/:id/comments", isLoggedIn, function(req, res){
	Project.findById(req.params.id, function(err, bieganie){
		if(err){
			console.log(err);
			res.redirect("/bieganie");
		} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					//req.flash("message", "Coś poszło nie tak");
					console.log(err);
				} else {
					//add credentials to comment associated with login
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					//save changes
					bieganie.comments.push(comment);
					bieganie.save();
					//req.flash("move", "Coś poszło nie tak");
					res.redirect('/bieganie/' + bieganie._id);
				}
			});
		}
	});
});

//GET route to view to edit Comment

router.get("/bieganie/:id/comments/:comment_id/edit", isLoggedIn, function(req, res){
	Comment.findById(req.params.comment_id, function(err, checkComment){
		if(err){
			res.redirect("back");
		} else {
			res.render("comments/edit", {bieganie_id: req.params.id, comment: checkComment});
		}
	});
});

//UPDATE COMMENTARIES

router.put("/bieganie/:id/comments/:comment_id", commentOwner, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
	//redirect
			req.flash({message: req.flash("move", "Update`owano komentarz")});
			res.redirect("/bieganie/" + req.params.id);
		}
	});
});

//DELETE COMMENTARIES

router.delete("/bieganie/:id/comments/:comment_id", commentOwner, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else {
			req.flash({message: req.flash("move", "Usunięto komentarz")});
			res.redirect("/bieganie/" + req.params.id);
		}
	});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("err", "Musisz być zalogowany/zalogowana");
	res.redirect("/login");
}

function commentOwner(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, checkComment){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			//is that user`s commentary?
			if(checkComment.author.id.equals(req.user._id)){
				next();
				} else {
					res.redirect("back");
			}
		}
	});
	} else { 
		res.redirect("back");
	}
}



module.exports = router;

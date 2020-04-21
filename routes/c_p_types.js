var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Types = require('../models/category');


//-----GET INDEX TYPES-----
router.get('/', function (req, res) {
    Types.find(function (err, types) {
        if (err)
            return console.log(err);
		//find in  folder path
        res.render('admin/types', {
            types: types
        });
    });
});


//-----GET ADD TYPES-----
router.get('/add-type', function (req, res) {
    var title = "";
    res.render('admin/new_type', {
        title: title
    });

});


//-----POST TYPES-----
router.post('/add-type', function (req, res) {

    req.checkBody('title', 'title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/new_type', {
            errors: errors,
            title: title
        });
    } else {
        Types.findOne({slug: slug}, function (err, type) {
            if (type) {
                req.flash('info', 'Type name exists, write different.');
                res.render('admin/new_type', {
                    title: title
                });
            } else {
                var types = new Types({
                    title: title,
                    slug: slug
                });

                types.save(function (err) {
                    if (err)
                        return console.log(err);

                    Types.find(function (err, types) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.types = types;
                        }
                    });

                    req.flash('success', 'New type title added');
                    res.redirect('/shop/admin/types');
                });
            }
        });
    }

});

//-----GET EDIT TYPES-----
router.get('/edit-edit/:id', function (req, res) {

    Types.findById(req.params.id, function (err, type) {
        if (err)
            return console.log(err);

        res.render('admin/edit_types', {
            title: type.title,
            id: type._id
        });
    });

});


//-----POST EDIT TYPES-----
router.post('/edit-tpye/:id', function (req, res) {

    req.checkBody('title', 'title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_types', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
		req.flash('info', 'You are in edit mode');
        Types.findOne({slug: slug, _id: {'$ne': id}}, function (err, type) {
            if (type) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_types', {
                    title: title,
                    id: id
                });
            } else {
                Types.findById(id, function (err, type) {
                    if (err)
                        return console.log(err);

                    type.title = title;
                    type.slug = slug;

                    type.save(function (err) {
                        if (err)
                            return console.log(err);

                        Types.find(function (err, types) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.types = types;
                            }
                        });

                        req.flash('success', 'Type edited');
                        res.redirect('/shop/admin/types/edit-category/' + id);
                    });

                });


            }
        });
    }

});

//-----GET DELETE TYPES-----
router.get('/delete-type/:id', function (req, res) {
    Types.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Types.find(function (err, types) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.types = types;
            }
        });

        req.flash('warning', 'Type deleted');
        res.redirect('/shop/admin/types/');
    });
});

exports.isAdmin = function(req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    } else {
        req.flash('danger', 'Please log in as admin.');
        res.redirect('/login');
    }
}


// Exports
module.exports = router;

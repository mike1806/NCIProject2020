var express = require('express');
var router = express.Router();


// Get Page model
var Sites = require('../models/page');


//-----GET ADMIN PAGES MENU-----

router.get('/', function (req, res) {
    Sites.find({}).sort({sorting: 1}).exec(function (err, sites) {
		//find in folder path
        res.render('admin/sites', {
            sites: sites
        });
    });
});


//-----GET ADD PAGES MENU-----
router.get('/add-site', function (req, res) {

    var title = "";
    var slug = "";
    var content = "";
	//find in folder path
    res.render('admin/new_site', {
        title: title,
        slug: slug,
        content: content
    });

});

//-----POST ADD PAGES MENU-----
router.post('/add-site', function (req, res) {

    req.checkBody('title', 'Name cannot be empty.').notEmpty();
    req.checkBody('content', 'Content cannot be empty.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/new_site', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Sites.findOne({slug: slug}, function (err, site) {
            if (site) {
                req.flash('danger', 'Site slug exists, choose another.');
                res.render('admin/new_site', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var site = new Sites({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                site.save(function (err) {
                    if (err)
                        return console.log(err);

                    Sites.find({}).sort({sorting: 1}).exec(function (err, sites) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.sites = sites;
                        }
                    });

                    req.flash('success', 'Site successfully added');
                    res.redirect('/shop/admin/sites');
                });
            }
        });
    }

});


//-----GET EDIT SITES MENU-----
router.get('/edit-site/:id', function (req, res) {

    Sites.findById(req.params.id, function (err, site) {
        if (err)
            return console.log(err);
	    req.flash('info', 'You are in edit mode');
        res.render('admin/edit_site', {
            title: site.title,
            slug: site.slug,
            content: site.content,
            id: site._id
        });
    });

});

// POST route editing site
router.post('/edit-site/:id', function (req, res) {

    req.checkBody('title', 'name cannot be empty.').notEmpty();
    req.checkBody('content', 'content cannot be empty.').notEmpty();

    var name = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug == "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_site', {
            errors: errors,
            title: name,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        req.flash('info', 'You are in edit mode');
        Sites.findOne({slug: slug, _id: {'$ne': id}}, function (err, site) {
            if (site) {
                req.flash('danger', 'Site slug in DB, choose another.');
                res.render('admin/edit_site', {
                    title: name,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {

                Sites.findById(id, function (err, site) {
                    if (err)
                        return console.log(err);

                    site.title = name;
                    site.slug = slug;
                    site.content = content;

                    site.save(function (err) {
                        if (err)
                            return console.log(err);
                       
                        req.flash('success', 'Site edited');
                        res.redirect('/shop/admin/sites/' + id);
                    });
                });
            }
        });
    }
});

//-----GET delete SITES MENU-----
router.get('/delete-site/:id', function (req, res) {
    Sites.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Sites.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', 'Site deleted');
        res.redirect('/shop/admin/sites/');
    });
});



module.exports = router;





var express = require('express');
var router = express.Router();

// Page model
var Site = require('../models/page');


//-----GET index site------

router.get('/shop', function (req, res) {
    
    Site.findOne({slug: 'home'}, function (err, site) {
        if (err)
            console.log(err);

        res.render('index', {
            title: site.title,
            content: site.content
        });
    });
    
});


//-----GET SITE------

router.get('/:slug', function (req, res) {

    var slug = req.params.slug;

    Site.findOne({slug: slug}, function (err, site) {
        if (err)
            console.log(err);
        
        if (!site) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: site.title,
                content: site.content
            });
        }
    });

    
});



// Exports
module.exports = router;



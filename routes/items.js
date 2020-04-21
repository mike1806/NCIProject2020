var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;
// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');

//-----GET all items-----*
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            item: 'All products',
            products: products
        });
    });

});


//-----GET items by types-----*
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({slug: categorySlug}, function (err, c) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                item: c.item,
                products: products
            });
        });
    });

});

//-----GET item details-----*
router.get('/:category/:product', function (req, res) {

    var galleryImages = null;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        item: product.item,
                        p: product,
                        galleryImages: galleryImages,
                    });
                }
            });
        }
    });

});


// Exports
module.exports = router;



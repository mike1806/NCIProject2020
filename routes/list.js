var express = require('express');
var router = express.Router();

// Get Product model
var Product = require('../models/product');

// GET route for add item to Shopping list

router.get('/add/:product', isLoggedIn, function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, p) {
        if (err)
            console.log(err);

        if (typeof req.session.list == "undefined") {
            req.session.list = [];
            req.session.list.push({
                item: slug,
                qty: 1,
				//to provide amout with two digits after coma as price value
                cost: parseFloat(p.cost).toFixed(2),
                image: '/product_images/' + p._id + '/' + p.image
            });
        } else {
            var list = req.session.list;
            var newItem = true;

            for (var x = 0; x < list.length; x++) {
                if (list[x].item == slug) {
                    list[x].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                list.push({
                    item: slug,
                    qty: 1,
                    cost: parseFloat(p.cost).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                });
            }
        }

//console.log(req.session.list);
        req.flash('success', 'Item added!');
        res.redirect('back');
    });

});

// GET route for final check item

router.get('/sum', isLoggedIn, function (req, res) {

    if (req.session.list && req.session.list.length == 0) {
        delete req.session.list;
        res.redirect('/shop/list/sum');
    } else {
        res.render('sum', {
            item: 'Checkout',
            list: req.session.list
        });
    }

});

// GET route for update item

router.get('/update/:product', isLoggedIn, function (req, res) {

    var slug = req.params.product;
    var list = req.session.list;
    var action = req.query.action;

    for (var x = 0; x < list.length; x++) {
        if (list[x].item == slug) {
            switch (action) {
                case "add":
                    list[x].qty++;
                    break;
                case "remove":
                    list[x].qty--;
                    if (list[x].qty < 1)
                        list.splice(x, 1);
                    break;
                case "clear":
                    list.splice(x, 1);
                    if (list.length == 0)
                        delete req.session.list;
                    break;
                default:
                    console.log('update error');
                    break;
            }
            break;
        }
    }

    req.flash('info', 'List updated');
    res.redirect('/shop/list/sum');

});

// GET remove current list

router.get('/clear', function (req, res) {

    delete req.session.list;
    
    req.flash('success', 'List emptied!');
    res.redirect('/shop/list/sum');

});
//GET buy
router.get('/buynow', function (req, res) {

    delete req.session.list;
        res.sendStatus(200);

});

//Middleware for log-in

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('success', 'Welcome to B/Z Online Shop');
	res.redirect("/login");

}


module.exports = router;


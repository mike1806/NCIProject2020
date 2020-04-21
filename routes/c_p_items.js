var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Item = require('../models/product');

// Get Category model
var Type = require('../models/category');


//GET products index
 router.get('/',  function (req, res) {
	var count;

    Item.count(function (err, c) {
        count = c;
    });

    Item.find(function (err, products) {
        res.render('admin/items', {
            products: products,
            count: count
        });
    });
});

//-----GET route for count ITEM------*
router.get('/new-item', function (req, res) {

    var item = "";
    var info = "";
    var cost = "";

    Type.find(function (err, categories) {
        res.render('admin/new_item', {
            item: item,
            info: info,
            categories: categories,
            cost: cost
        });
    });


});
//-----GET endpoint to retrieve Items in JSON-----*

router.get('/endpointProduct', function (req, res) {
    Item.find({}, function(err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong while Retrieving data');
    } else {
      // console.log(data[0]); Data will be displayed in JSON format
      res.json(data);
    }
  });

});

//-----POST route for ADD ITEMS------*

router.post('/new-item', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('item', 'item must have a value.')
    req.checkBody('info', 'infoription must have a value.')
    req.checkBody('cost', 'cost must have a value.')
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var item = req.body.item;
    var slug = item.replace(/\s+/g, '-').toLowerCase();
    var info = req.body.info;
    var cost = req.body.cost;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Type.find(function (err, categories) {
            res.render('admin/new_item', {
                errors: errors,
                item: item,
                info: info,
                categories: categories,
                cost: cost
            });
        });
    } else {
        req.flash('info', 'Please add parameters to add new item to shop');
        Item.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Type.find(function (err, categories) {
                    res.render('admin/new_item', {
                        item: item,
                        info: info,
                        categories: categories,
                        cost: cost
                    });
                });
            } else {

                var cost2 = parseFloat(cost).toFixed(2);

                var product = new Item({
                    item: item,
                    slug: slug,
                    info: info,
                    cost: cost2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {return console.log(err);});
                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {return console.log(err);});
                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {return console.log(err);});

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Item added');
                    res.redirect('/shop/admin/items');
                });
            }
        });
    }

});

//-----GET route for edit Item----
router.get('/edit-item/:id', function (req, res) {

    var errors;
    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Type.find(function (err, categories) {

        Item.findById(req.params.id, function (err, p) {
			if (err) {
                console.log(err);
                res.redirect('/admin/items');
            } else {
	            req.flash('info', 'You are in edit mode');
				var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_item', {
                            item: p.item,
                            errors: errors,
                            info: p.info,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            cost: parseFloat(p.cost).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});

//-----POST route for EDIT ITEMS------

router.post('/edit-item/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('item', 'item cannot be empty.').notEmpty();
    req.checkBody('info', 'info cannot be empty.').notEmpty();
    req.checkBody('cost', 'cost must be numeric value.').isDecimal();
    req.checkBody('image', 'only image formats').isImage(imageFile);

    var item = req.body.item;
    var slug = item.replace(/\s+/g, '-').toLowerCase();
    var info = req.body.info;
    var cost = req.body.cost;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/items/edit-item/' + id);
    } else {
	    req.flash('info', 'Item title exists, choose another.');
        Item.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Item in DB, type different.');
                res.redirect('/admin/items/edit-item/' + id);
            } else {
                Item.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.item = item;
                    p.slug = slug;
                    p.info = info;
                    p.cost = parseFloat(cost).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Item edited');
                        res.redirect('/shop/admin/items/edit-item/' + id);
                    });

                });
            }
        });
    }

});

//-----POST ITEM in GALLERY------
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(path), {width: 120, height: 120}).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

//-----GET DELETE FOTO------*

router.get('/delete-image/:image', function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/shop/admin/items/edit-item/' + req.query.id);
                }
            });
        }
    });
});


//-----GET DELETE ITEMS------*

router.get('/delete-items/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Item.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('warning', 'Product deleted');
            res.redirect('/shop/admin/items');
        }
    });

});

// Exports
module.exports = router;








/*var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Item = require('../models/product');

// Get Category model
var Type = require('../models/category');

//-----GET route for INDEX o ITEMS------*

router.get('/', function (req, res) {
    var add;

    Item.count(function (err, a) {
        add = a;
    });

    Item.find(function (err, items) {
        res.render('admin/products', {
            items: items,
            add: add
        });
    });
});


//-----GET route for ADD ITEM------*

router.get('/new-item', function (req, res) {

    var name = "";
    var info = "";
    var cost = "";

    Type.find(function (err, types) {
		//show page to add new Item
		req.flash('info', 'Add values to new Shop`s Item');
        res.render('admin/new_item', {
            title: name,
            info: info,
            categories: types,
            cost: cost
        });
    });


});

//-----GET endpoint to retrieve Items in JSON-----*

router.get('/endpointProduct', function (req, res) {
    Item.find({}, function(err, data) {
    if (err) {
      console.log(err);
      return res.send(500, 'Something Went wrong while Retrieving data');
    } else {
      // console.log(data[0]); Data will be displayed in JSON format
      res.json(data);
    }
  });

});



router.post('/new-item', function (req, res) {

    var photoIt = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Name cannot be empty.').notEmpty();
    req.checkBody('info', 'Info cannot be empty.').notEmpty();
    req.checkBody('cost', 'Cost must have numeric value.').isDecimal();
    req.checkBody('image', 'You must upload photo').isImage(photoIt);

    var name = req.body.title;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var info = req.body.info;
    var cost = req.body.cost;
    var type = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Type.find(function (err, types) {
            res.render('admin/new_item', {
                errors: errors,
                title: name,
                info: info,
                categories: types,
                cost: cost
            });
        });
    } else {
		req.flash('info', 'You are in add item mode');
        Item.findOne({slug: slug}, function (err, item) {
            if (item) {
                    Type.find(function (err, types) {
                    res.render('admin/new_item', {
                        title: name,
                        info: info,
                        categories: types,
                        cost: cost
                    });
                });
            } else {

                var costs = parseFloat(cost).toFixed(2);

                var item = new Item({
                    title: name,
                    slug: slug,
                    info: info,
                    cost: costs,
                    category: type,
                    image: photoIt
                });

                item.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + item._id, function (err) {return console.log("Sth went wrong" + err);});
                    mkdirp('public/product_images/' + item._id + '/gallery', function (err) {return console.log("Sth went wrong" + err);});
                    mkdirp('public/product_images/' + item._id + '/gallery/thumbs', function (err) {return console.log("Sth went wrong" + err);});

                    if (photoIt != "") {
                        var itemPhoto = req.files.image;
                        var path = 'public/product_images/' + item._id + '/' + photoIt;

                        itemPhoto.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'You have added new item to list!');
                    res.redirect('/shop/admin/products');
                });
            }
        });
    }

});


//-----GET route EDIT ITEM------*


router.get('/edit-item/:id', function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Type.find(function (err, categories) {

        Item.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/shop/admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var itemsPhotos = null;

                fs.readdir(itemsPhotos, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_item', {
                            title: p.title,
                            errors: errors,
                            info: p.info,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            cost: parseFloat(p.cost).toFixed(2),
                            image: p.image,
                            itemsPhotos: itemsPhotos,
                            id: p._id
                        });
                    }
                });
            }
        });

    });

});


//-----POST route for EDIT ITEMS------

router.post('/edit-item/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('info', 'infoription must have a value.').notEmpty();
    req.checkBody('cost', 'cost must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var info = req.body.info;
    var cost = req.body.cost;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/shop/admin/products/edit-item/' + id);
    } else {
        Item.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Item title exists, choose another.');
                res.redirect('/shop/admin/products/edit-item/' + id);
            } else {
                Item.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.info = info;
                    p.cost = parseFloat(cost).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/shop/admin/products/edit-item/' + id);
                    });

                });
            }
        });
    }

});

//-----POST ITEM in GALLERY------


router.post('/product-gallery/:id', function (req, res) {

    var itemPhoto = req.files.file;
    var id = req.params.id;
    var way = 'public/product_images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + req.files.file.name;

    itemPhoto.mv(way, function (err) {
        if (err)
            console.log(err);

        resizeImg(fs.readFileSync(way), {width: 120, height: 120}).then(function (cre) {
            fs.writeFileSync(thumbsPath, cre);
        });
    });

    res.sendStatus(200);

});

//-----GET DELETE FOTO------


router.get('/delete-image/:image', function (req, res) {

    var freshItem = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var subGroupPhoto = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(freshItem, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(subGroupPhoto, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('warning', 'Item has been deleted.');
                    res.redirect('/shop/admin/products/edit-item/' + req.query.id);
                }
            });
        }
    });
});

//-----GET DELETE ITEMS------


router.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var way = 'public/product_images/' + id;

    fs.remove(way, function (err) {
        if (err) {
            console.log(err);
        } else {
            Item.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Item has been deleted.');
            res.redirect('/shop/admin/products');
        }
    });

});

// Exports
module.exports = router;
*/


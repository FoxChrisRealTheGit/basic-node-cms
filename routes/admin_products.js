const express = require("express")
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");
const auth = require("../config/auth")
const isAdmin = auth.isAdmin;

// GET Product model
const Product = require("../models/product")


// GET Category model
const Category = require("../models/category")

/*
* GET Product index
*/
router.get("/", isAdmin, function (req, res) {
    let count;

    Product.count(function (err, c) {
        count = c;
    })

    Product.find(function (err, products) {
        res.render("admin/products", {
            products: products,
            count: count
        })
    })
})

/*
* GET add Product
*/
router.get("/add-product", isAdmin, function (req, res) {
    let title = "";
    let description = "";
    let price = "";

    Category.find(function (err, categories) {
        res.render("admin/add_product", {
            title: title,
            description: description,
            categories: categories,
            price: price
        })
    })
})

/*
* POST add Product
*/
router.post("/add-product", isAdmin, function (req, res) {
    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody("title", "Title must have a value.").notEmpty();
    req.checkBody("description", "Description must have a value.").notEmpty();
    req.checkBody("price", "Price must have a value.").isDecimal();
    req.checkBody("image", "You must upload an image.").isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;

    let errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render("admin/add_product", {
                errors: errors,
                title: title,
                description: description,
                categories: categories,
                price: price
            })
        })
    } else {
        Product.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash("danger", "Product title exists, chooser another.")
                Category.find(function (err, categories) {
                    res.render("admin/add_product", {
                        title: title,
                        description: description,
                        categories: categories,
                        price: price
                    })
                })
            } else {
                let price2 = parseFloat(price).toFixed(2);
                let product = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    price: price2,
                    category: category,
                    image: imageFile
                });
                product.save(function (err) {
                    if (err) { return console.log(err) };

                    mkdirp("public/product_images/" + product._id, function (err) {
                        return console.log(err)
                    })
                    mkdirp("public/product_images/" + product._id + "/gallery", function (err) {
                        return console.log(err)
                    })
                    mkdirp("public/product_images/" + product._id + "/gallery/thumbs", function (err) {
                        return console.log(err)
                    })

                    if (imageFile != "") {
                        let productImage = req.files.image;
                        let path = "public/product_images/" + product._id + "/" + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err)
                        })
                    }

                    req.flash("success", "Product added!");
                    res.redirect("/admin/products");
                })
            }
        })
    }
})

/*
* GET edit Product
*/
router.get("/edit-product/:id", isAdmin, function (req, res) {
    let errors;

    if (req.session.errors) {
        errors = eq.session.errors;
    } else {
        req.session.errors = null;
    }
    Category.find(function (err, categories) {
        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err)
                res.redirect("/admin/products")
            } else {
                let galleryDir = "public/product_images/" + p._id + "/gallery"
                let galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files

                        res.render("admin/edit_product", {
                            title: p.title,
                            errors: errors,
                            description: p.description,
                            categories: categories,
                            category: p.category.replace(/\s+/g, "-").toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        })
                    }
                })
            }
        })
    })
})

/*
* POST edit Product
*/
router.post("/edit-product/:id", isAdmin, function (req, res) {
    let imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody("title", "Title must have a value.").notEmpty();
    req.checkBody("description", "Description must have a value.").notEmpty();
    req.checkBody("price", "Price must have a value.").isDecimal();
    req.checkBody("image", "You must upload an image.").isImage(imageFile);

    let title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    let description = req.body.description;
    let price = req.body.price;
    let category = req.body.category;
    let pimage = req.body.pimage;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        req.session.error = errors;
        res.redirect("/admin/products/edit-products/" + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function (err, p) {
            if (err) {
                console.log(err);
            }

            if (p) {
                req.flash("danger", "Product title exists, choose another.")
                res.redirect("/admin/products/edit-product" + id)
            } else {
                Product.findById(id, function (err, p) {
                    if (err) {
                        console.log(err)
                    }

                    p.title = title;
                    p.slug = slug;
                    p.description = description;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile
                    }

                    p.save(function (err) {
                        if (err) {
                            console.log(err)
                        }

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove("public/product_images/" + id + "/" + pimage, function (err) {
                                    if (err) {
                                        console.log(err)
                                    }
                                })
                            }

                            let productImage = req.files.image;
                            let path = "public/product_images/" + id + "/" + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err)
                            })
                        }

                        req.flash("success", "Product added!");
                        res.redirect("/admin/products");
                    })
                })
            }
        })
    }

})

/*
* POST product gallery
*/
router.post("/product-gallery/:id", isAdmin, function (req, res) {
    let productImage = req.files.file;
    let id = req.params.id;
    let path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
    let thumbsPath = "public/product_images/" + id + "/gallery/thumbs" + req.files.file.name;

    productImage.mv(path, function (err) {
        if (err) {
            console.log(err);
        }

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buf) {
            fs.writeFileSync(thumbsPath, buf);
        })
    })
    res.sendStatus(200);
})

/*
* GET delete image
*/
router.get("/delete-image/:image", isAdmin, function (req, res) {
    let originalImage = "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
    let thumbsImage = "public/product_images/" + req.query.id + "/gallery/thumbs/" + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err)
        } else {
            fs.remove(thumbsImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash("success", "Image deleted!");
                    res.redirect("/admin/products/edit-products/" + req.query.id)
                }
            })
        }
    })

})

/*
* GET delete Product
*/
router.get("/delete-product/:id", isAdmin, function (req, res) {

    let id = req.params.id;
    let path = "public/product_images" + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err)
        } else {
            Product.findByIdAndRemove(id, function (err) {
                if (err) {
                    console.log(err)
                }
            })

            req.flash("success", "Product deleted!")
            res.redirect("/admin/products")
        }
    })
})

//Exports
module.exports = router;
const express = require("express")
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

// GET Product model
const Product = require("../models/product")


// GET Category model
const Category = require("../models/category")

/*
* GET Product index
*/
router.get("/", function (req, res) {
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
router.get("/add-product", function (req, res) {
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
router.post("/add-page", function (req, res) {

    req.checkBody("title", "Title must have a value.").notEmpty();
    req.checkBody("content", "Content must have a value.").notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, "-").toLowerCase();
    }
    let content = req.body.content;

    let errors = req.validationErrors();

    if (errors) {
        return res.render("admin/add_page", {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        })
    } else {
        Page.findOne({ slug: slug }, function (err, page) {
            if (page) {
                req.flash("danger", "Page slug exists, chooser another.")
                return res.render("admin/add_page", {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function (err) {
                    if (err) { return console.log(err) };

                    req.flash("success", "Page added!");
                    res.redirect("/admin/pages");
                })
            }
        })
    }
})

/* 
* POST reorder pages
*/
router.post("/reorder-pages", function (req, res) {
    let ids = req.body["id[]"]
    let count = 0;

    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err) {
                        return console.log(err)
                    }
                });
            });
        })(count);
    }
})


/*
* GET edit Product
*/
router.get("/edit-page/:id", function (req, res) {
    Page.findById(req.params.id, function (err, page) {
        if (err) {
            return console.log(err)
        } else {
            res.render("admin/edit_page", {
                title: page.title,
                slug: page.slug,
                content: page.content,
                id: page._id
            })
        }
    })
})

/*
* POST edit Product
*/
router.post("/edit-page/:id", function (req, res) {

    req.checkBody("title", "Title must have a value.").notEmpty();
    req.checkBody("content", "Content must have a value.").notEmpty();

    let title = req.body.title;
    let slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    if (slug == "") {
        slug = title.replace(/\s+/g, "-").toLowerCase();
    }
    let content = req.body.content;
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        return res.render("admin/edit_page", {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        })
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function (err, page) {
            if (page) {
                req.flash("danger", "Page slug exists, chooser another.")
                return res.render("admin/edit_page", {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function (err, page) {
                    if (err) {
                        return console.log(err);
                    } else {
                        page.title = title;
                        page.slug = slug;
                        page.content = content;

                        page.save(function (err) {
                            if (err) { return console.log(err) };

                            req.flash("success", "Page added!");
                            res.redirect("/admin/pages");
                        })
                    }
                })

            }
        })
    }
})

/*
* GET delete Product
*/
router.get("/delete-page/:id", function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            return console.log(err)
        } else {
            req.flash("success", "Page deleted!")
            res.redirect("/admin/pages/")
        }
    })
})

//Exports
module.exports = router;
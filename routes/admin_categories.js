const express = require("express")
const router = express.Router();
const auth = require("../config/auth")
const isAdmin = auth.isAdmin;
// GET page model
const Category = require("../models/category")
/*
* GET category index
*/
router.get("/",isAdmin, function (req, res) {
    Category.find(function (err, categories) {
        if (err) {
            return console.log(err)
        } else {
            res.render("admin/categories", {
                categories: categories
            })
        }
    })
})

/*
* GET add category
*/
router.get("/add-category", isAdmin, function (req, res) {
    let title = "";

    res.render("admin/add_category", {
        title: title
    })
})

/*
* POST add category
*/
router.post("/add-category",isAdmin, function (req, res) {

    req.checkBody("title", "Title must have a value.").notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    let errors = req.validationErrors();

    if (errors) {
        return res.render("admin/add_category", {
            errors: errors,
            title: title
        })
    } else {
        Category.findOne({ slug: slug }, function (err, category) {
            if (category) {
                req.flash("danger", "Category title exists, choose another.")
                return res.render("admin/add_category", {
                    title: title
                });
            } else {
                let category = new Category({
                    title: title,
                    slug: slug
                });
                category.save(function (err) {
                    if (err) { return console.log(err) };
                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err)
                        } else {
                            req.app.locals.categories = categories;
                        }
                    })
                    req.flash("success", "Page added!");
                    res.redirect("/admin/categories");
                })
            }
        })
    }
})

/*
* GET edit category
*/
router.get("/edit-category/:id",isAdmin, function (req, res) {
    Category.findById(req.params.id, function (err, category) {
        if (err) {
            return console.log(err)
        } else {
            res.render("admin/edit_category", {
                title: category.title,
                id: category._id
            })
        }
    })
})

/*
* POST edit category
*/
router.post("/edit-category/:id",isAdmin, function (req, res) {

    req.checkBody("title", "Title must have a value.").notEmpty();

    let title = req.body.title;
    let slug = title.replace(/\s+/g, "-").toLowerCase();
    let id = req.params.id;

    let errors = req.validationErrors();

    if (errors) {
        return res.render("admin/edit_category", {
            errors: errors,
            title: title,
            id: id
        })
    } else {

        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (err, category) {
            if (category) {
                req.flash("danger", "Category title exists, chooser another.")
                return res.render("admin/edit_category", {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err) {
                        return console.log(err);
                    }
                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err) { return console.log(err) };
                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err)
                            } else {
                                req.app.locals.categories = categories;
                            }
                        })
                        req.flash("success", "Page added!");
                        res.redirect("/admin/categories");
                    })

                })

            }
        })
    }
})

/*
* GET delete page
*/
router.get("/delete-category/:id",isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            return console.log(err)
        }

        Category.find(function (err, categories) {
            if (err) {
                console.log(err)
            } else {
                req.app.locals.categories = categories;
            }
        })
        req.flash("success", "Category deleted!")
        res.redirect("/admin/categories")

    })
})

//Exports
module.exports = router;
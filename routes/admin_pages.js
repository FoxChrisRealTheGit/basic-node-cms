const express = require("express")
const router = express.Router();
// GET page model
const Page = require("../models/page")
/*
* GET pages index
*/
router.get("/", function (req, res) {
    Page.find({}).sort({sorting: 1}).exec(function(err, pages){
        res.render("admin/pages", {
            pages: pages
        })
    })
})

/*
* GET add page
*/
router.get("/add-page", function (req, res) {
    let title = "";
    let slug = "";
    let content = "";

    res.render("admin/add_page", {
        title: title,
        slug: slug,
        content: content
    })
})

/*
* POST add page
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
                    if (err) {return console.log(err)};

                    req.flash("success", "Page added!");
                   res.redirect("/admin/pages");
                })
            }
        })
    }

    
})

//Exports
module.exports = router;
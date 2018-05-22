const express = require("express")
const router = express.Router();
const fs = require("fs-extra");
// GET Product model
const Product = require("../models/product")
// GET Category model
const Category = require("../models/category")

/*
* GET  all products
*/

router.get("/", function (req, res) {
    Product.find(function (err, products) {
        if (err) {
            console.log(err);
        }
        res.render("all_products", {
            title: "All products",
            products: products
        })

    })
})

/*
* GET  products by category
*/

router.get("/:category", function (req, res) {

    let categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, function (err, c) {
        Product.find({ category: categorySlug }, function (err, products) {
            if (err) {
                console.log(err);
            }
            res.render("cat_products", {
                title: c.title,
                products: products
            })

        })
    })
})

/*
* GET  product details
*/

router.get("/:categor/product", function (req, res) {

    let galleryImages = null;

    Product.findOne({ slug: req.params.product }, function (err, product) {
        if (err) {
            console.log(err)
        } else {
            let galleryDir = "public/product_images/" + product._id + "/gallery";

            fs.redirect(galleryDir, function (err, files) {
                if (err) {
                    console.log(err)
                } else {
                    galleryImages = files;

                    res.render("product", {
                        title: product.title,
                        product: product,
                        galleryImages: galleryImages
                    })
                }

            })
        }
    })

})


//Exports
module.exports = router;
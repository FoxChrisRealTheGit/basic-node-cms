const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator")
const path = require("path");
const config = require("./config/database")
const fileUpload = require("express-fileupload")

// Connect to db
mongoose.connect(config.database)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB")
})


//Init app
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")

//Set public folder
app.use(express.static(path.join(__dirname, "public")))


// Set global errors variable
app.locals.errors = null;

// Get page model
let Page = require("./models/page");

// Get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
    if (err) {
        console.log(err)
    } else {
        app.locals.pages = pages;
    }
})

// Get category model
let Category = require("./models/category");

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err)
    } else {
        app.locals.categories = categories;
    }
})

// Express fileUpload middleware
app.use(fileUpload());

// Body Parser Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//Parse application/json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
    secret: "keybaord cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        let namespace = param.split(".")
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += "[" + namespace.shift() + "]";
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            let extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case ".jpg":
                    return ".jpg"
                case ".jpeg":
                    return ".jpeg"
                case ".png":
                    return ".png"
                case "":
                    return ".jpg"
                default:
                    return false
            }
        }
    }
}));

// Express Messages middleware;
app.use(require("connect-flash")());
app.use(function (req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    next();
});

app.get("*", function(req, res, next){
    res.locals.cart = req.session.cart;
    next();
})

// Set routes
const pages = require("./routes/pages")
const products = require("./routes/products")
const cart = require("./routes/cart")
const adminPages = require("./routes/admin_pages")
const adminCategories = require("./routes/admin_categories")
const adminProducts = require("./routes/admin_products")

app.use("/admin/pages", adminPages)
app.use("/admin/categories", adminCategories)
app.use("/admin/products", adminProducts)
app.use("/products", products)
app.use("/cart", cart)
app.use("/", pages)

//start the server
const port = 3000;
app.listen(port, function () {
    console.log("Server started on port " + port)
})
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
    }
}));

// Express Messages middleware;
app.use(require("connect-flash")());
app.use(function (req, res, next) {
    res.locals.messages = require("express-messages")(req, res);
    next();
});

// Set routes
const pages = require("./routes/pages")
const adminPages = require("./routes/admin_pages")
const adminCategories = require("./routes/admin_categories")
const adminProducts = require("./routes/admin_products")

app.use("/admin/pages", adminPages)
app.use("/admin/categories", adminCategories)
app.use("/admin/products", adminProducts)
app.use("/", pages)

//start the server
const port = 3000;
app.listen(port, function () {
    console.log("Server started on port " + port)
})
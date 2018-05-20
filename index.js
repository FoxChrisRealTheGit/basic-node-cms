const express = require("express");
const path = require("path");

//Init app
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs")

//Set public folder
app.use(express.static(path.join(__dirname, "public")))


app.get("/", function(req, res){
    res.send("working")
})

//start the server
const port = 3000;
app.listen(port, function(){
    console.log("Server started on port " + port)
})
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({limit: "10mb", extended: false}));
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on("error", error=>console.log(error));
db.on("open", ()=>console.log("Connected to mongoose"));

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const ajaxRouter = require("./routes/ajax");
const testRouter = require("./routes/test");
app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/ajax", ajaxRouter);
app.use("/test", testRouter);

app.listen(process.env.PORT || 3000);
const express = require("express");
const router = express.Router();
const Website = require("../models/Website");

router.get("/", async(req, res)=>{
    let id = "5e3c389a2648c030089391d6";
    let fonts = ["Raleway","Italianno","Lobster"]; //dynamically needed from database 
    let website;
    let siteCSS = "";
    try{
        website = await Website.findById(id);
        siteCSS = `sites/${website.fileName}`;
    }catch(e){
        errorLog(e);
    }
    res.render("index", {css:["main", siteCSS], website, fonts});
});

errorLog = error => console.log("ERROR in INDEX: " + error); 

module.exports = router;
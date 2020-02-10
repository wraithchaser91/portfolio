const express = require("express");
const router = express.Router();
const Website = require("../models/Website");

router.get("/", async(req, res)=>{
    let id = "5e3c389a2648c030089391d6";
    let fonts = ["Raleway","Italianno","Lobster"]; //dynamically needed from database 
    let website;
    let siteCSS = "";
    try{
        console.log("trying to find website");
        const websites = await Website.find({});
        console.log("website found")
        website = websites[0];
        siteCSS = `sites/${website.fileName}`;
    }catch(e){
        errorLog(e);
    }
    res.render("index", {css:["admin/main", siteCSS], website, fonts});
});

errorLog = error => console.log("ERROR in INDEX: " + error); 

module.exports = router;
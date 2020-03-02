const express = require("express");
const router = express.Router();
const Website = require("../models/Website");

router.get("/", async(req, res)=>{
    let fonts = ["Raleway","Italianno","Lobster"]; //dynamically needed from database 
    let website;
    let siteCSS = "";
    try{
        const websites = await Website.find({});
        website = websites[websites.length-1];
        siteCSS = `sites/${website.fileName}`;
    }catch(e){
        errorLog(e);
    }
    res.render("index_2", {css:["main2", siteCSS], website, fonts});
});

errorLog = error => console.log("ERROR in INDEX: " + error); 

module.exports = router;
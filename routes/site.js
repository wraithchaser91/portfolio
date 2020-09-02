const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const Feature = require("../models/Feature");
const {errorLog, render} = require("../utils");
let css = ["site"];
router.get("/:name", async(req, res)=>{
    let pagination = [];
    let website;
    let features;
    try{
        const websites = await Website.find({state:0}).sort({liveDate:-1}).exec();
        for(let i = 0; i < websites.length; i++){
            if(websites[i].name.replace(/ /g ,"").toLowerCase() == req.params.name){
                website = websites[i];
                let prev = i-1;
                if(prev < 0)prev = websites.length-1;
                let next = i+1;
                if(next>= websites.length)next=0;
                pagination.push(websites[prev]);
                pagination.push(websites[next]);
            }
        }
        if(typeof website == "undefined"){
            res.redirect("/error/404");
            return;
        }
        siteCSS = `sites/${website.fileName}`;
        features = await Feature.find({isShown:true}).sort({name:1}).exec();
    }catch(e){
        if(errorLog(e,req,res,`Could not load the site: ${req.params.id}`, "/error/404"))return;
    }
    render(req,res,"sites", {css:[...css, siteCSS], website, pagination,features});
});

module.exports = router;
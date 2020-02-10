const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const Preferences = require("../models/Preferences");


router.get("/", async(req, res)=>{
    // let fonts = ["Italianno","Lobster"];
    // res.render("index", {css:["main","sites/tafariaCastle"], fonts});
    res.send("AJAX main");
});

router.get("/data/:type", async(req, res)=>{
    let data = [];
    try{
        const prefs = await Preferences.findOne({});
        switch(req.params.type){
            case "pagelist":
                res.send(JSON.stringify(prefs.pageList));
                return;
            case "featurelist":
                res.send(JSON.stringify(prefs.featureList));
                return;
            case "group":
                res.send(JSON.stringify(prefs.groupList));
                return;
            default:
                errorLog(`Could not find data for type:${req.params.type}`);
        }
    }catch(e){
        errorLog(e);
        res.redirect("/admin");
    }
    res.send(data);
});

router.get("/data/website/:type/:name", async(req, res)=>{
    let data = [];
    try{
        const site = await Website.findOne({name:req.params.name});
        if(!site){
            errorLog(`no site found for ${req.params.name}`);
            res.redirect("/admin");
        }else{
            switch(req.params.type){
                case "pagelist":
                    data = JSON.stringify(site.pageList);
                    break;
                case "featurelist":
                    data = JSON.stringify(site.featureList);
                    break;
                case "group":
                    data = site.group;
                    break;
                case "images":
                    data = JSON.stringify(site.imagePath);
                    break;
                default:
                    errorLog(`Could not find data for type:${req.params.type}`);
                    res.redirect("/admin");
            }
        }
    }catch(e){
        errorLog(e);
        res.redirect("/admin");
    }
    res.send(data);
});

errorLog = error => console.log("ERROR in AJAX: "+error);

module.exports = router;
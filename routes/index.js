const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const {errorLog, render} = require("../utils");
let css = ["home"];

router.get("/", async(req, res)=>{
    let websites;
    try{
        websites = await Website.find({state:0});
        // for(let website of websites){
        //     website.description = "Description Not Found";
        //     await website.save();
        // }
    }catch(e){
        if(errorLog(e,req,res,"Could not load the sites", "/error/404"))return;
    }
    render(req,res,"index",{css,websites});
    
});

module.exports = router;
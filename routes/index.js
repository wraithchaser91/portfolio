const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const {checkPhone} = require("../middleware");
const {errorLog, render} = require("../utils");
let css = ["home"];

router.get("/", checkPhone, async(req, res)=>{
    let websites;
    try{
        websites = await Website.find({state:0}).sort({liveDate:-1}).limit(12).exec();
        
    }catch(e){
        if(errorLog(e,req,res,"Could not load the sites", "/error/404"))return;
    }
    render(req,res,"index",{css,websites});
});

router.get("/loadmore", async(req,res)=>{
    let obj = {
        status: 200,
        statusText: "OK",
        ok:true
    }
    try{
        let skip = parseInt(req.query.skip);
        let limit = parseInt(req.query.limit);
        let list = await Website.find({state:0}).sort({liveDate:-1}).skip(skip).limit(limit).exec();
        obj.data = list;
    }catch(e){
        console.log(e);
        obj.status = 500;
        obj.statusText = `${e}`;
        obj.ok = false;
    }
    res.send(obj);
});

router.get("/sort/:sort", async(req,res)=>{
    let websites;
    try{
        let sortOn = req.params.sort;
        if(sortOn=="date")websites = await Website.find({state:0}).sort({liveDate:-1}).exec();
        else if(sortOn=="name")websites = await Website.find({state:0}).sort({name:1}).exec();
        else if(sortOn=="pages"){
            let allSites = await Website.find({state:0});
            websites = sortArrayByPages(allSites);
        }else if(sortOn=="features"){
            let allSites = await Website.find({state:0});
            websites = sortArrayByFeatures(allSites);
        }else if(sortOn=="primaryColour"){
            websites = await Website.find({state:0}).sort({primarColour:1}).exec();
        }else{
             websites = await Website.find({state:0}).sort({liveDate:-1}).exec();
        }
        
    }catch(e){
        if(errorLog(e,req,res,"Could not load the sites", "/error/404"))return;
    }
    render(req,res,"index",{css,websites});
});

sortArrayByPages = initArray =>{
    let newArray = [];
    while(initArray.length > 0){
        let largest = -1;
        let toRemove = [];
        for(let site of initArray){
            if(site.pageList.length > largest)largest = site.pageList.length;
        }
        for(let site of initArray){
            if(site.pageList.length == largest){
                toRemove.push(site);
                newArray.push(site);
            }
        }
        initArray = initArray.filter(item=>!toRemove.includes(item));
    }
    return newArray;
}

sortArrayByFeatures = initArray =>{
    let newArray = [];
    while(initArray.length > 0){
        let largest = -1;
        let toRemove = [];
        for(let site of initArray){
            if(site.featureList.length > largest)largest = site.featureList.length;
        }
        for(let site of initArray){
            if(site.featureList.length == largest){
                toRemove.push(site);
                newArray.push(site);
            }
        }
        initArray = initArray.filter(item=>!toRemove.includes(item));
    }
    return newArray;
}

module.exports = router;
const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const Feature = require("../models/Feature");
let css = ["mobile"];

router.get("/", async(req,res)=>{
    let features = [];
    try{
        features = await Feature.find({isShown:true}).sort({name:1}).exec();
    }catch(e){
        console.log(`Could not find features: ${e}`)
    }
    render(req,res,"mobile",{css,features});
});

router.get("/sites", async(req,res)=>{
    try{
        let websites = await Website.find({state:0}).sort({liveDate:1}).exec();
        res.send({
            status:200,
            ok:true,
            statusText:"OK",
            websites
        });
    }catch(e){
        console.log("fail");
        res.send({
            status:500,
            ok:false,
            statusText:`Error loading sites: ${e}`
        })
    }
})

module.exports = router;
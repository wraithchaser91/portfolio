const express = require("express");
const router = express.Router();
const Template = require("../models/template");
const Relation = require("../models/relation");

router.get("/", async(req, res)=>{
    res.render("index");
});

router.get("/objects", async(req, res)=>{
    let objects = [];
    try{
        objects = await Template.find({});
    }catch(error){
        errorLog(error);
    }
    res.send(objects);
});

router.post("/newObject", async(req, res)=>{ //Should change this to post if creating a model
    if(req.body.name === ""){
        res.redirect("/");
        return;
    }
    try{
        let template = new Template({name:req.body.name});
        await template.save();
        let relation = new Relation({name:"test", template});
        await relation.save();
    }catch(error){
        errorLog(error);
    }
    res.redirect("/objects");
});

router.get("/relation", async(req, res)=>{
    let object;
    let nameToFind = "";
    if(req.query.name && req.query.name != ""){
        nameToFind = req.query.name;
    }
    try{
        let user = await Template.findOne({name:nameToFind});
        object = await Relation.findOne({template:user});
    }catch(error){
        errorLog(error);
    }
    res.send(object);
});

errorLog = error =>{
    console.log(error);
}

module.exports = router;
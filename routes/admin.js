const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const Preferences = require("../models/Preferences");
const Feature = require("../models/Feature");
const {errorLog, render} = require("../utils");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join(__dirname.split("routes")[0], 'public', 'images', 'sites');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})
let imageNameFields = ["desktopImage", "tabletImage", "mobileImage","backgroundImage","smallBG","smallDesktop"];
let imageArrayFields = [];
for(let imageName of imageNameFields){
    imageArrayFields.push({name: imageName});
}
const {checkAuthentication} = require("../middleware");
router.use(checkAuthentication);
//method override
const methodOverride = require("method-override");
router.use(methodOverride("_method"));

router.get("/", (req,res)=>{
    render(req,res,"admin",{css:["/admin/main"]});
});

router.get("/websitemodels", async(req, res)=>{
    let websites = [];
    try{
        websites = await Website.find({}).sort({name:1}).exec();
    }catch(e){
        if(errorLog(e,req,res,"Error getting all website models","/admin"))return;
    }
    render(req,res,"admin/websitemodels",{css:["/admin/main"], websites});
});

router.get("/new", (req, res)=>{
    render(req,res,"admin/new",{css:["/admin/main","/admin/new"], pikaday:1});
});

router.post("/new", upload.fields(imageArrayFields), async(req, res)=>{
    let fileNames = getFileNames(req.files);
    let website;
    try{
        let isName = true;
        let test = await Website.findOne({name:req.body.name});
        if(test == null){
            test = await Website.findOne({fileName:req.body.fileName});
            isName = false;
        }
        website = createWebsite(req,res,req.body);
        website.imageFileNames = fileNames;
        if(test){
            removeFileNames(fileNames);
            render(req,res,"admin/new",{css:["/admin/main", "/admin/new"], website, message:`A model with the same ${(isName?'hotel':'file')} name already exists`});
            return;
        }else{
            await website.save();
        }
    }catch(e){
        removeFileNames(fileNames);
        if(errorLog(e,req,res,"Error creating new model"))return;
    }
    res.redirect(`/admin/websitemodels`);
});

router.get("/update/:id", async(req,res) =>{
    let website;
    try{
        website = await Website.findById(req.params.id);;
    }catch(e){
        if(errorLog(e,req,res,"Error finding models to update","/admin/websitemodels"))return;
    }
    render(req,res,"admin/update",{css:["admin/main", "admin/new"], website, pikaday:1});
});

router.post("/update/:id", async(req,res) =>{
    try{
        let website = await Website.findById(req.params.id);
        website = updateSite(req,res,website, req.body);
        await website.save();
    }catch(e){
        if(errorLog(e,req,res,"Error updating model"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.get("/update/state/:id", async(req, res) =>{
    if(!req.query.state || req.query.state == ""){
        res.redirect("/admin/websitemodels");
    }
    try{
        let website = await Website.findById(req.params.id);
        website.state = req.query.state;
        await website.save();
    }catch(e){
        if(errorLog(e,req,res,"Error updating state"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.get("/updateImages/:id", async(req,res) =>{
    let website;
    try{
        website = await Website.findById(req.params.id);;
    }catch(e){
        if(errorLog(e,req,res,"Error accessing model to update images","/admin/websitemodels"))return;
    }
    render(req,res,"admin/updateImages",{css:["admin/main", "admin/new"], website});
});

router.post("/updateImages/:id", upload.fields(imageArrayFields), async(req,res) =>{
    try{
        let website = await Website.findById(req.params.id);;
        removeFileNames(website.imageFileNames);
        website.imageFileNames = getFileNames(req.files);
        await website.save();
    }catch(e){
        if(errorLog(e,req,res,"Error updating images"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.get("/activate", async(req,res)=>{
    try{
        let websites = await Website.find({});
        for(let website of websites){
            website.state = 0;
            await website.save();
        }
    }catch(e){
        if(errorLog(e,req,res,"Error activating all website models"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.get("/deactivate", async(req,res)=>{
    try{
        let websites = await Website.find({});
        for(let website of websites){
            website.state = 2;
            await website.save();
        }
    }catch(e){
        if(errorLog(e,req,res,"Error deactivating all website models"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.delete("/delete/:id", async(req,res)=>{
    try{
        let model = await Website.findById(req.params.id);
        if(!model || typeof model == "undefined"){
            errorLog("Error", req,res,"Error deleting model, no model found");
            res.redirect("/admin/websitemodels");
            return;
        }
        await model.remove();
    }catch(e){
        if(errorLog(e,req,res,"Error deleting website model"))return;
    }
    res.redirect("/admin/websitemodels");
});

router.get("/features", async(req,res)=>{
    let features;
    try{
        features = await Feature.find({}).sort({name:1}).exec();
    }catch(e){
        if(errorLog(e,req,res,"Error retrieving features","/admin"))return;
    }
    render(req,res,"admin/features",{css:["/admin/main", "/admin/features"], features});
});

router.post("/features/update/:id", async(req,res)=>{
    if(!req.params.id || typeof req.params.id == "undefined"){
        errorLog("Error", req,res,"Error updating feature, no id passed to server");
        return;
    }
    try{
        let feature = await Feature.findById(req.params.id);
        if(!feature || typeof feature == "undefined"){
            errorLog("Error", req,res,"Error updating feature, no feature found");
            return;
        }
        feature.description = req.body.description;
        await feature.save();
    }catch(e){
        if(errorLog(e,req,res,"Error updating feature"))return;
    }
    res.redirect("/admin/features");
});

router.get("/features/enable/:id", async(req,res)=>{
    if(!req.params.id || typeof req.params.id == "undefined"){
        errorLog("Error", req,res,"Error enabling feature, no id passed to server");
        return;
    }
    try{
        let feature = await Feature.findById(req.params.id);
        if(!feature || typeof feature == "undefined"){
            errorLog("Error", req,res,"Error enabling feature, no feature found");
            return;
        }
        feature.isShown = true;
        await feature.save();
    }catch(e){
        if(errorLog(e,req,res,"Error enabling feature"))return;
    }
    res.redirect("/admin/features");
});

router.get("/features/disable/:id", async(req,res)=>{
    if(!req.params.id || typeof req.params.id == "undefined"){
        errorLog("Error", req,res,"Error disabling feature, no id passed to server");
        return;
    }
    try{
        let feature = await Feature.findById(req.params.id);
        if(!feature || typeof feature == "undefined"){
            errorLog("Error", req,res,"Error disabling feature, no feature found");
            return;
        }
        feature.isShown = false;
        await feature.save();
    }catch(e){
        if(errorLog(e,req,res,"Error disabling feature"))return;
    }
    res.redirect("/admin/features");
});

getFileNames = files =>{
    let list = [];
    for(let i = 0; i < imageNameFields.length; i++){
        list.push(files[imageNameFields[i]][0]["filename"]);
    }
    return list;
}

removeFileNames = array =>{
    for(let fileName of array){
        if(fileName == "" || !fileName)continue;
        fs.unlink(path.join(uploadPath, fileName), err => {
            if (err) console.log(`Error removing files: ${err}`);
        })
    }
}

let groupActiveOn = ["Multi Site", "Group Site", "Landing Page"];
createWebsite = (req,res,body) =>{
    let website = new Website({
        name: body.name,
        url: body.url,
        howItWasMade: body.howItWasMade,
        type: body.type,
        fileName: body.fileName,
        liveDate: new Date(body.liveDate),
        pageList: JSON.parse(body.pageList),
        featureList: JSON.parse(body.featureList),
        primaryColour: body.primaryColour,
        secondaryColour: body.secondaryColour,
        description: body.description,
        state: 1
    });
    if(groupActiveOn.includes(body.type)){
        website.group = body.group;
    }
    addFiles(req,res,website.pageList, website.featureList, (groupActiveOn.includes(body.type)?website.group:null));
    return website;
}

updateSite = (req,res,site, body) =>{
    site.name = body.name;
    site.url = body.url;
    site.howItWasMade = body.howItWasMade;
    site.type = body.type;
    site.fileName = body.fileName;
    site.liveDate = new Date(body.liveDate);
    site.pageList = JSON.parse(body.pageList);
    site.featureList = JSON.parse(body.featureList);
    site.primaryColour = body.primaryColour;
    site.secondaryColour = body.secondaryColour;
    site.description = body.description;
    if(groupActiveOn.includes(body.type)){
        site.group = body.group;
    }
    addFiles(req,res,site.pageList, site.featureList, (groupActiveOn.includes(body.type)?site.group:null));
    return site;
}

let dupeList = [
    ["rooms", "room", "accommodation", "acommodation", "accomodation", "stay"],
    ["home", "about", "about us"]
];
let retList = ["Accommodation", "Home"]

addToList = (list, item) => !list.includes(item);

addFiles = async(req,res,pageList, featureList, group) =>{
    try{
        let prefs = await Preferences.findOne();
        let prefPages = prefs.pageList;
        for(let page of pageList){
            if(page == "")continue;
            if(prefPages.includes(page))continue;
            let toAdd = true;
            for(let i = 0; i < dupeList.length; i++){
                if(dupeList[i].includes(page.toLowerCase())){
                    if(prefPages.includes(retList[i])){
                        toAdd = false;
                        break;
                    }
                }
            }
            if(toAdd)prefPages.push(page);
        }
        let prefFeatures = prefs.featureList;
        for(let feature of featureList){
            if(!prefFeatures.includes(feature)){
                prefFeatures.push(feature);
                let newFeature = new Feature({name:feature});
                await newFeature.save();
            }
        }
        let prefGroups = prefs.groupList;
        if(group != null && group != "")if(!prefGroups.includes(group))prefGroups.push(group);
        prefs.pageList = prefPages;
        prefs.featureList = prefFeatures;
        prefs.groupList = prefGroups;
        await prefs.save();
    }catch(e){
        if(errorLog(e,req,res,"Error adding files"))return;
    }
}

module.exports = router;

const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const Preferences = require("../models/Preferences");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadPath = path.join('public', 'images/sites');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})
let fonts = ["Raleway","Italianno","Lobster"];
let imageNameFields = ["desktopImage", "tabletImage", "mobileImage", "backgroundImage"];
let imageArrayFields = [];
for(let imageName of imageNameFields){
    imageArrayFields.push({name: imageName});
}

router.get("/login", async(req,res)=>{
    //will be used to verify user credentials
});

router.get("/", async(req, res)=>{
    let websites = [];
    try{
        websites = await Website.find({});
    }catch(error){
        errorLog(error);
    }
    res.render("admin", {css:["/admin/main"], websites});
});

router.get("/new", (req, res)=>{
    res.render("admin/new", {css:["/admin/main","/admin/new"], fonts});
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
        website = createWebsite(req.body);
        website.imageFileNames = fileNames;
        if(test){
            removeFileNames(fileNames);
            res.render("admin/new", {css:["/admin/main", "/admin/new"], website, message:`A model with the same ${(isName?'hotel':'file')} name already exists`, fonts});
            return;
        }else{
            await website.save();
            await saveCSS(website);
        }
    }catch(error){
        removeFileNames(fileNames);
        errorLog(error);
    }
    res.redirect(`/admin`);
});

router.get("/update/:id", async(req,res) =>{
    try{
        const website = await Website.findById(req.params.id);;
        res.render("admin/update", {css:["admin/main", "admin/new"], website, fonts});
    }catch(e){
        errorLog(e);
        res.redirect("/admin");
    }
});

router.post("/update/:id", async(req,res) =>{
    try{
        let website = await Website.findById(req.params.id);
        website = updateSite(website, req.body);
        await website.save();
        await saveCSS(website);
    }catch(e){
        errorLog(e);
    }
    res.redirect("/admin");
});

router.get("/update/state/:id", async(req, res) =>{
    if(!req.query.state || req.query.state == ""){
        res.redirect("/admin");
    }
    try{
        let website = await Website.findById(req.params.id);
        website.state = req.query.state;
        await website.save();
    }catch(e){
        errorLog(e);
    }
    res.redirect("/admin");
});

router.get("/updateImages/:id", async(req,res) =>{
    try{
        const website = await Website.findById(req.params.id);;
        res.render("admin/updateImages", {css:["admin/main", "admin/new"], website});
    }catch(e){
        errorLog(e);
        res.redirect("/admin");
    }
});

router.post("/updateImages/:id", upload.fields(imageArrayFields), async(req,res) =>{
    try{
        let website = await Website.findById(req.params.id);;
        removeFileNames(website.imageFileNames);
        website.imageFileNames = getFileNames(req.files);
        await website.save();
        await saveCSS(website);
    }catch(e){
        errorLog(e);
    }
    res.redirect("/admin");
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
            if (err) errorLog(err);
        })
    }
}

let groupActiveOn = ["Multi Site", "Group Site", "Landing Page"];
createWebsite = body =>{
    let website = new Website({
        name: body.name,
        url: body.url,
        howItWasMade: body.howItWasMade,
        type: body.type,
        fileName: body.fileName,
        liveDate: new Date(body.liveDate),
        pageList: JSON.parse(body.pageList),
        featureList: JSON.parse(body.featureList),
        primaryFont: body.primaryFont,
        secondaryFont: body.secondaryFont,
        primaryColour: body.primaryColour,
        secondaryColour: body.secondaryColour,
        state: 1
    });
    if(groupActiveOn.includes(body.type)){
        website.group = body.group;
    }
    addFiles(website.pageList, website.featureList, (groupActiveOn.includes(body.type)?website.group:null));
    return website;
}

updateSite = (site, body) =>{
    site.name = body.name;
    site.url = body.url;
    site.howItWasMade = body.howItWasMade;
    site.type = body.type;
    site.fileName = body.fileName;
    site.liveDate = new Date(body.liveDate);
    site.pageList = JSON.parse(body.pageList);
    site.featureList = JSON.parse(body.featureList);
    site.primaryFont = body.primaryFont;
    site.secondaryFont = body.secondaryFont;
    site.primaryColour = body.primaryColour;
    site.secondaryColour = body.secondaryColour;
    if(groupActiveOn.includes(body.type)){
        site.group = body.group;
    }
    addFiles(site.pageList, site.featureList, (groupActiveOn.includes(body.type)?site.group:null));

    return site;
}

let dupeList = [
    ["rooms", "room", "accommodation", "acommodation", "accomodation", "stay"],
    ["home", "about", "about us"]
];
let retList = ["Accommodation", "Home"]

addToList = (list, item) => !list.includes(item);

addFiles = async(pageList, featureList, group) =>{
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
            if(!prefFeatures.includes(feature))prefFeatures.push(feature);
        }
        let prefGroups = prefs.groupList;
        if(group != null && group != "")if(!prefGroups.includes(group))prefGroups.push(group);
        prefs.pageList = prefPages;
        prefs.featureList = prefFeatures;
        prefs.groupList = prefGroups;
        await prefs.save();
    }catch(e){
        errorLog(e);
    }
}

addExtras = (font1, font2) =>{
    let string = "";
    if(font1 == "Italianno"){
        string+=`
        #mainContainer h1::before{
            content: '';
            width: 65%;
            position: absolute;
            height: 60px;
            display: block;
            border-bottom: 2px solid var(--mainColour);
            border-radius: 50%;
            left: 35%;
            bottom:0.5vh;
            opacity:0.5;
        }
        
        #mainContainer h1::after{
            content: '';
            width: 65%;
            position: absolute;
            height: 60px;
            display: block;
            border-top: 2px solid var(--mainColour);
            border-radius: 50%;
            left: 0%;
            bottom:-3vh;
            opacity:0.5;
        }`;
    }

    return string;
}

createCSS = (website) =>{ 
    let css ="";
    css+=`:root{--mainColour:${website.primaryColour};--secondaryColour:${website.secondaryColour};`;
    css+=`--primaryFont:'${website.primaryFont}', sans-serif;`;
    css+=`--secondaryFont:'${website.secondaryFont}', sans-serif;}`;
    css+=`body::before{background-image:url(/images/sites/${website.imageFileNames[3]});}`;
    css+=addExtras(website.primaryFont, website.secondaryFont);
    return css;
}

saveCSS = async(website) =>{
    try{
        await fs.promises.writeFile(`../Portfolio/public/css/sites/${website.fileName}.css`, createCSS(website));
    }catch(e){
        errorLog(e);
    }
}

errorLog = error => console.log("ERROR in ADMIN:" + error);

module.exports = router;
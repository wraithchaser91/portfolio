const express = require("express");
const router = express.Router();
const Website = require("../models/Website");
const CSS = require("../models/CSS");
const Preferences = require("../models/Preferences");
let fonts = ["Raleway","Italianno","Lobster"];

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

let fs = require("fs").promises;
router.post("/new", async(req, res)=>{
    try{
        let isName = true;
        let test = await Website.findOne({name:req.body.name});
        if(test == null){
            test = await Website.findOne({fileName:req.body.fileName});
            isName = false;
        }
        let website = createWebsite(req.body);
        let cssStylesArray = req.body.cssStyles;
        let css = new CSS({
            element: [`root,--mainColour:red;`]
        });
        website.css = css;
        if(test){
            res.render("admin/new", {css:["/admin/main", "/admin/new"], website, message:`A model with the same ${(isName?'hotel':'file')} name already exists`, fonts});
            return;
        }else{
            await css.save();
            await website.save();
            await saveCSS(website,css);
        }
    }catch(error){
        errorLog(error);
    }
    res.redirect("/admin");
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
        let website = await Website.findById(req.params.id).populate("css").exec();
        let css = website.css;
        let cssStylesArray = JSON.parse(req.body.cssArray);
        css.element = [`:root^--mainColour:${cssStylesArray[2]};--secondaryColour:${cssStylesArray[3]}`];
        website = updateSite(website, req.body);
        await css.save();
        await website.save();
        await saveCSS(website,css);
    }catch(e){
        errorLog(e);
    }
    res.redirect("/admin");
});

let groupActiveOn = ["Multi Site", "Group Site", "Landing Page"];
createWebsite = body =>{
    imageDetails = getImageDetails([body.desktopImage,body.tabletImage, body.mobileImage, body.backgroundImage]);
    let website = new Website({
        name: body.name,
        url: body.url,
        howItWasMade: body.howItWasMade,
        type: body.type,
        fileName: body.fileName,
        liveDate: new Date(body.liveDate),
        pageList: JSON.parse(body.pageList),
        featureList: JSON.parse(body.featureList),
        images: imageDetails[0],
        imageTypes: imageDetails[1]
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
    if(groupActiveOn.includes(body.type)){
        site.group = body.group;
    }
    addFiles(site.pageList, site.featureList, (groupActiveOn.includes(body.type)?site.group:null));
    imageDetails = getImageDetails([body.desktopImage,body.tabletImage, body.mobileImage, body.backgroundImage]);
    site.images = imageDetails[0];
    site.imageTypes = imageDetails[1];

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
        if(group != null && group.length > 0)if(!prefGroups.includes(group[0]))prefGroups.push(group[0]);
        prefs.pageList = prefPages;
        prefs.featureList = prefFeatures;
        prefs.groupList = prefGroups;
        await prefs.save();
    }catch(e){
        console.log(e);
    }
}

getImageDetails = files =>{
    let imageList = [];
    let imageTypeList = [];
    for(let i = 0; i < files.length; i++){
        if(files[i] == null)continue;
        const image = JSON.parse(files[i]);
        let type = image.type.split(";")[0];
        if(image != null && type == "image/jpeg"){
            imageList.push(new Buffer.from(image.data, "base64"));
            imageTypeList.push(type);
        }
    }
    
    return [imageList, imageTypeList];
}


createCSS = (cssModel) =>{
    let cssArray = cssModel.element;
    let css ="";
    for(let ele of cssArray){
        let parts = ele.split("^");
        let values = parts[1].split(";");
        css+=`${parts[0]}{`;
        for(let value of values){
            css+=value+";";
        }
        css+=`}`;
    }
    return css;
}

saveCSS = async(website,css)=> {
    try{
        await fs.writeFile(`../Portfolio/public/css/sites/${website.fileName}.css`, createCSS(css));
    }catch(e){
        errorLog(e);
    }
}

errorLog = error => console.log("ERROR in ADMIN:" + error);

module.exports = router;
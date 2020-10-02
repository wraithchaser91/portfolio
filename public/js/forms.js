let objectHandler = new ObjectHandler({defColour:"#fff",mainColour:"#ff5858",aniTime:0.3});

let listEles = document.getElementsByClassName("list");
let holderEles = document.getElementsByClassName("holder");

let lists = [];
let groupList;
for(let i = 0; i < listEles.length; i++){
    let temp = new List(objectHandler,listEles[i], holderEles[i],100, (i==2?true:false));
    objectHandler.addItem(temp);
    lists.push(temp);
    if(i == 2)groupList = temp;
}

let divList = document.getElementsByClassName("newDiv");
let labelList = document.getElementsByClassName("newLabel");
let buttonList = document.getElementsByClassName("newButton");
let inputList = document.getElementsByClassName("newInput");

let transAmount = [150,150,200];
for(let i  = 0; i < divList.length; i++){
    objectHandler.addItem(new ListInput(objectHandler,divList[i],inputList[i],labelList[i],buttonList[i],lists[i],transAmount[i]));
}

document.addEventListener("click", ()=>{
    objectHandler.closeAll();
});

let groupActiveOn = ["Multi Site", "Group Site", "Landing Page"];
let groupRow = document.getElementById("groupRow");
let dateRow = document.getElementById("dateRow");
let typeSelect = document.getElementById("typeSelect");
let isGroup = false;
if(groupActiveOn.includes(typeSelect.selectedOptions[0].value)){
    groupRow.style.transform = "scaleY(1)";
    dateRow.style.marginTop = "0";
    isGroup = true;
}
typeSelect.addEventListener("change", ()=>{
    if(groupActiveOn.includes(typeSelect.value)){
        groupRow.style.transform = "scaleY(1)";
        dateRow.style.marginTop = "0";
        isGroup = true;
    }else{
        groupRow.style.transform = "scaleY(0)";
        dateRow.style.marginTop = "-7vh";
        isGroup = false;
    }
});

let hotelNameEle = document.getElementById("hotelName");
let fileNameEle = document.getElementById("fileName");
hotelNameEle.addEventListener("blur", ()=>{
    fileNameEle.value = hotelNameEle.value.toLowerCase().replace(/ /g, "");
});

let form = document.getElementById("newSiteForm");
form.addEventListener("submit", (e)=>{
    e.preventDefault();
    if(isGroup){
        if(groupList.getList().length > 0){
            if(form.checkValidity())startSave();
        }
    }else{
        if(form.checkValidity())startSave();
    }
});

startSave = () =>{
    //adding extra values to form
    let listNames = ["pageList", "featureList", "group"];
    for(let i = 0; i < listNames.length; i++){
        if(!isGroup && listNames[i] == "group")continue;
        let input = document.createElement("input");
        let list = lists[i].getList();
        let value = (listNames[i] == "group"?list[0]:JSON.stringify(list));
        input.value = value;
        input.name = listNames[i];
        input.style.display = "none";
        form.appendChild(input);
    }
    
    form.submit();
}

//Propagate the lists on the page
let reqNames = ["pagelist", "featurelist", "group"];
for(let i = 0; i < reqNames.length; i++){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let array = JSON.parse(this.responseText).sort();
            for(let item of array){
                lists[i].addItem(item);
            }
            //send another request if we are on the update page
            if(window.location.href.split("admin/")[1].split("/")[0] == "update"){
                let req2 = new XMLHttpRequest();
                req2.onreadystatechange = function(){
                    if(this.readyState == 4 && this.status == 200){
                        if(reqNames[i] == "group"){
                            let name = req2.responseText;
                            if(name)lists[i].massAdd(name);
                        }else{
                            let array = JSON.parse(req2.responseText);
                            if(array == null)return;
                            if(array.length == 0)return;
                            lists[i].massAdd(array);
                        }
                    }
                };
                req2.open("GET", `/ajax/data/website/${reqNames[i]}/${document.getElementById("hotelName").value}`, true);
                req2.send();
            }
        }
    };
    req.open("GET", `/ajax/data/${reqNames[i]}`, true);
    reqs.push(req);
}
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileEncode
)

let ponds = FilePond.parse(document.body);
for(let pond of ponds){
    pond.on('addfile', (error, file) => {
        if (error) {
            console.log('ERROR: Failed to upload file');
            return;
        }
        if(file.fileType.split(";")[0] != "image/jpeg")pond.removeFile();
    });
}
let locationHREF = window.location.href.split("admin/")[1];
if(typeof locationHREF != "undefined" && locationHREF.split("/")[0] == "update"){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let array = JSON.parse(req.responseText);
            for(let i = 0; i < ponds.length; i++){
                if(typeof array[i] != "undefined") ponds[i].addFile(array[i]);
            }
        }
    };
    req.open("GET", `/ajax/data/website/images/${document.getElementById("hotelName").value}`, true);
    reqs.push(req);
}
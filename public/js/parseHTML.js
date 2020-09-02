/////***HTML Parsing***\\\\\
// Everything starts with ^* and end with ^ and split with ~
// New Paragraphs - ^*p^
// Anchors - ^*a~link~(0-targetNotBlank/1-targetBlank)~value^
// Formatted text - ^*t~b/i/u~value^
// Message/Information - ^*m~value~colour^

createAnchor = (link,isBlank,text) => {
    let a = document.createElement("a");
    let node = document.createTextNode(`${text} `);
    a.appendChild(node);
    a.href=link;
    a.className="internalLink";
    if(isBlank==1){
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noreferrer');
    }
    return a;
}
createTextNode = text =>{
    return document.createTextNode(`${text} `);
}

createStyledTextNode = (text,isBold,isItalic,isUnderline) =>{
    let p = document.createElement("span");
    p.textContent = text;
    if(isBold)p.style.fontWeight = "bold";
    if(isItalic)p.style.fontStyle = "italic";
    if(isUnderline)p.style.textDecoration = "underline";
    return p;
}

createColouredTextNode = (text,colour) =>{
    let p = document.createElement("span");
    p.textContent = text;
    p.style.color = colour;
    return p;
}

parseHTML = () =>{
    let elementsToParse = document.getElementsByClassName("featureDescription");
    let toRemove = [];
    for(let ele of elementsToParse){
        let content = ele.textContent;
        if(!content.includes("^"))continue;
        let parent = ele.parentElement;
        let p = document.createElement("p");
        toRemove.push({parent:parent, ele:ele});
        let parts = content.split("^");
        for(let part of parts){
            if(part[0] == "*"){
                let codeString = part.substring(1,part.length);
                let pieces = codeString.split("~");
                if(pieces[0]=="a"){
                    p.appendChild(createAnchor(pieces[1], pieces[2], pieces[3]));
                }else if(pieces[0]=="t"){
                    let styles = pieces[1].split("/");
                    let isBold = styles.includes("b");
                    let isItalic = styles.includes("i");
                    let isUnderlined = styles.includes("u");
                    p.appendChild(createStyledTextNode(pieces[2], isBold, isItalic, isUnderlined));
                }else if(pieces[0]=="p"){
                    parent.appendChild(p);
                    p = document.createElement("p");
                }else if(pieces[0]=="m"){
                    p.appendChild(createColouredTextNode(pieces[1], pieces[2]));
                }

                else{
                    console.log(`WARNING: Could not pass HTML code with tag type ${pieces[0]}`);
                    p.appendChild(createTextNode(part));
                }
            }else{
                p.appendChild(createTextNode(part));
            }
        }
        parent.appendChild(p);
    }
    for(let e of toRemove){
        e.parent.removeChild(e.ele);
    }
}

window.addEventListener("load", ()=>parseHTML());
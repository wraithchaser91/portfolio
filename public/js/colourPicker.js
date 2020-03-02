class Pixel{
    constructor(red, green, blue){
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
}

class ColourPicker{
    constructor(row, list, check, drop, r=255, g=255, b=255){
        this.row = row;
        this.list = list;
        this.setColour();
        this.check = check;
        this.drop = drop;
        this.rotate = 0;
        this.changeColour(r,g,b);
        this.isClicked = false;
        this.addListeners();
    }
    setColour(){
        let red = 0;
        let green = 0;
        let blue = 255;
        let threshold = 255;
        let amount = 5;
        this.pixels = [];
        for(let i = 0; i < this.list.length; i++){
            this.pixels.push(new Pixel(red,green,blue));
            this.list[i].style.backgroundColor = `rgb(${red},${green},${blue})`;
            this.list[i].addEventListener("click", ()=>{
                let pixel = this.pixels[i];
                this.set(pixel.red, pixel.green, pixel.blue);
                this.hueRotate(this.rotate);
                this.drop.style.backgroundColor = this.toString();
            });
            this.list[i].addEventListener("mouseenter", ()=>{
                let pixel = this.pixels[i];
                this.set(pixel.red, pixel.green, pixel.blue);
                this.hueRotate(this.rotate);
                this.check.style.backgroundColor = this.toString();
                if(this.isClicked){
                    this.drop.style.backgroundColor = this.toString();
                }
            })
            red+=amount;
            if(red > threshold){
                red = 0;
                green+=amount;
            }
        }
    }
    addListeners(){
        this.row.addEventListener("wheel", (e)=>{
            this.rotateColours(e.deltaY/10);
        });
        this.row.addEventListener("mousedown", ()=>{
            this.isClicked = true;
        });
        this.row.addEventListener("mouseup", ()=>{
            this.isClicked = false;
        });
        this.row.addEventListener("mouseleave", ()=>{
            this.isClicked = false;
        })
    }
    toString() {
        return `rgb(${Math.round(this.r)}, ${Math.round(this.g)}, ${Math.round(this.b)})`;
    }
    set(r, g, b) {
        this.r = this.clamp(r);
        this.g = this.clamp(g);
        this.b = this.clamp(b);
    }
    hueRotate(angle = 0) {
        angle = angle / 180 * Math.PI;
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        this.multiply([
        0.213 + cos * 0.787 - sin * 0.213,
        0.715 - cos * 0.715 - sin * 0.715,
        0.072 - cos * 0.072 + sin * 0.928,
        0.213 - cos * 0.213 + sin * 0.143,
        0.715 + cos * 0.285 + sin * 0.140,
        0.072 - cos * 0.072 - sin * 0.283,
        0.213 - cos * 0.213 - sin * 0.787,
        0.715 - cos * 0.715 + sin * 0.715,
        0.072 + cos * 0.928 + sin * 0.072,
        ]);
    }
    multiply(matrix) {
        const newR = this.clamp(this.r * matrix[0] + this.g * matrix[1] + this.b * matrix[2]);
        const newG = this.clamp(this.r * matrix[3] + this.g * matrix[4] + this.b * matrix[5]);
        const newB = this.clamp(this.r * matrix[6] + this.g * matrix[7] + this.b * matrix[8]);
        this.r = newR;
        this.g = newG;
        this.b = newB;
    }

    clamp(value) {
        if (value > 255) {
        value = 255;
        } else if (value < 0) {
        value = 0;
        }
        return value;
    }
    rotateColours = amount =>{
        this.rotate+=amount;
        this.row.style.filter = `hue-rotate(${this.rotate}deg)`;
    }
    changeColour(r, g, b){
        this.set(r,g,b);
        this.drop.style.backgroundColor = this.toString();
        this.check.style.backgroundColor = this.toString();
    }
}

let colourRows = document.getElementsByClassName("colourRow");
let colourSpans = [];
for(let row of colourRows){
    colourSpans.push(row.getElementsByTagName("span"));
}
let colourChecks = document.getElementsByClassName("colourCheck");
let colourDrops = document.getElementsByClassName("colourDrop");

let colourPickers = [];
for(let i = 0; i < colourRows.length; i++){
    colourPickers.push(new ColourPicker(colourRows[i],colourSpans[i],colourChecks[i],colourDrops[i], 66, 192, 220));
}

let colourColumns = document.getElementsByClassName("parentColourColumn");
let hexColumns = document.getElementsByClassName("hexColumn");
let colourPickerChoices = [0,0];
let colourChangeButtons = document.getElementsByClassName("colourChoice");
for(let i = 0; i < colourChangeButtons.length; i++){
    colourChangeButtons[i].addEventListener("click", (e)=>{
        if(colourPickerChoices[i] == 0){
            colourColumns[i].style.transform = "rotateY(90deg)";
            hexColumns[i].style.transform = "rotateY(0deg)";
            colourChangeButtons[i].textContent = "Change to Picker"
            colourPickerChoices[i] = 1;
        }else if(colourPickerChoices[i] == 1){
            colourColumns[i].style.transform = "rotateY(0deg)";
            hexColumns[i].style.transform = "rotateY(-90deg)";
            colourChangeButtons[i].textContent = "Change to Hex"
            colourPickerChoices[i] = 0;
        }
        return;
    });
}

let hexInputs = document.getElementsByClassName("hexInput");
for(let i = 0; i < hexInputs.length; i++){
    hexInputs[i].addEventListener("change", ()=>computeHex(i, hexInputs[i].value));
    hexInputs[i].addEventListener("keydown", (e)=>{
        if(e.key === "Enter"){
            e.preventDefault();
            computeHex(i, hexInputs[i].value);
        }
    });
}

findHexValue = value =>{
    let primary = value[0];
    let secondary = value[1];
    if(isNaN(primary)){
        primary = primary.toLowerCase();
        if(primary == "a")primary = 10;
        else if(primary == "b")primary = 11;
        else if(primary == "c")primary = 12;
        else if(primary == "d")primary = 13;
        else if(primary == "e")primary = 14;
        else if(primary == "f")primary = 15;
        else return -1;
    }
    if(isNaN(secondary)){
        secondary = secondary.toLowerCase();
        if(secondary == "a")secondary = 10;
        else if(secondary == "b")secondary = 11;
        else if(secondary == "c")secondary = 12;
        else if(secondary == "d")secondary = 13;
        else if(secondary == "e")secondary = 14;
        else if(secondary == "f")secondary = 15;
        else return -1;
    }
    return parseInt(primary)*16 + parseInt(secondary);
}

computeHex = (index, value) =>{
    value = value.trim();
    if(value == "")return;
    value = value.replace("#","");
    if(value.length != 6)return;
    let r = findHexValue(value.substring(0,2));
    if(r == -1)return;
    let g = findHexValue(value.substring(2,4));
    if(g == -1)return;
    let b = findHexValue(value.substring(4,6));
    if(b == -1)return;

    colourPickers[index].changeColour(r,g,b);
}
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
        this.set(r,g,b);
        this.drop.style.backgroundColor = this.toString();
        this.check.style.backgroundColor = this.toString();
        this.isClicked = false;
        this.addListeners();
    }
    setColour(){
        let red = 0;
        let green = 0;
        let blue = 255;
        let threshold = 255;
        let amount = 3;
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
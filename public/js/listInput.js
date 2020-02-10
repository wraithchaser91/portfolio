class ListInput{
    constructor(objectHandler, div, input, label, button, list, trans){
        this.objectHandler = objectHandler;
        this.div = div;
        this.input = input;
        this.label = label;
        this.button = button;
        this.list = list;
        this.trans = trans;
        this.isShown = false;
        this.addListeners();
    }
    addListeners(){
        this.label.addEventListener("click", (e)=>{
            e.stopPropagation();
            this.objectHandler.closeAll();
            this.moveInput();
        });
        this.button.addEventListener("click", (e)=>{
            e.stopPropagation();
            e.preventDefault();
            if(this.input.value != ""){
                this.startAdd();
            }else{
                this.input.focus();
            }
        });
        this.input.addEventListener("click", (e)=>e.stopPropagation());
        this.input.addEventListener("keydown", (e)=>{
            if(e.key === "Enter"){
                e.preventDefault();
                if(this.input.value != ""){
                    this.startAdd();
                }
            }
        });
    }
    moveInput(){
        if(this.isShown){
            this.label.style.transform = `translateY(${this.trans}%)`;
            this.label.style.color = this.objectHandler.prefs.defColour;
            this.div.style.transform = "scaleY(0)";
            this.isShown = false;
        }else{
            this.label.style.transform = "translateY(0)";
            this.label.style.color = this.objectHandler.prefs.mainColour;
            this.div.style.transform = "scaleY(1)";
            this.isShown = true;
            this.input.focus();
        }
    }
    startAdd(){
        this.list.addItem(this.input.value, true);
        this.input.value = "";
    }
}

class ObjectHandler{
    constructor(prefs, list = []){
        this.prefs = prefs;
        this.list = list;
    }
    addItem(item){
        this.list.push(item);
    }
    closeAll(){
        for(let item of this.list){
            if(item.isShown)item.moveInput();
        }
    }
}
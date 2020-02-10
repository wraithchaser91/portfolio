class Item{
    constructor(list, name){
        this.list = list;
        this.name = name;
        this.ref = this.createRef();
        this.inList = true;
    }
    createRef(){
        let heading = document.createElement("h3");
        heading.textContent = this.name;
        heading.addEventListener("click", (e)=>{
            e.stopPropagation();
            this.move();
        });
        return heading;
    }
    move(){
        if(this.inList){
            this.list.addToHolding(this);
        }else{
            if(this.list.isShown){
                this.list.addToList(this);
            }else{
                this.list.objectHandler.closeAll();
                this.list.moveInput();
            }
        }
        this.inList = !this.inList;
    }
}
class List{
    constructor(objectHandler, listContainer, listHolder, transAmount, isSingle=false){
        this.objectHandler = objectHandler;
        this.list = [];
        this.isShown = false;
        this.listContainer = listContainer;
        this.listContainer.addEventListener("click", (e)=>{
            e.stopPropagation();
        });
        this.listHolder = listHolder;
        this.listHolder.addEventListener("click", (e)=>{
            e.stopPropagation();
            this.objectHandler.closeAll();
            this.moveInput();
        });
        this.transAmount = transAmount;
        this.isSingle = isSingle;
    }
    addItem(name, addToContainer=false){
        let temp = new Item(this,name);
        this.list.push(temp);
        this.addToList(temp);
        if(addToContainer)temp.move();
    }
    addToHolding(ele){
        if(this.isSingle){
            this.empty();
        }
        this.listHolder.appendChild(ele.ref);
        ele.inList = true;
    }
    addToList(ele){
        this.listContainer.appendChild(ele.ref);
    }
    empty(){
        for(let ele of this.list){
            this.addToList(ele);
            ele.inList = true;
        }
    }
    massAdd(data){
        if(typeof data == "string"){
            for(let ele of this.list){
                if(ele.name == data){
                    ele.move();
                    break;
                }
            }
        }else{
            for(let item of data){
                for(let ele of this.list){
                    if(ele.name == item)ele.move();
                }
            }
        }
    }
    moveInput(){
        if(this.isShown){
            this.listContainer.style.transform = `translateY(${this.transAmount}%) scaleY(0)`;
            this.isShown = false;
        }else{
            this.listContainer.style.transform = `translateY(${this.transAmount}%) scaleY(1)`;
            this.isShown = true;
        }
    }
    getList(){
        let temp =  this.list.filter(item => !item.inList);
        let names = [];
        for(let name of temp){
            names.push(name.name);
        }
        return names;
    }
}
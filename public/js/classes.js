class Waiter{
    constructor(){
        this.setup();
    }
    setup(){
        this.overlay = createElement("div",{classList:"waiterOverlay flex-column"});
        this.overlay.addEventListener("click", (e)=>{
            e.stopPropagation();
        });
        this.spinner = createElement("div", {id:"spinningWheel"});
        this.overlay.appendChild(this.spinner);
        this.text = createElement("p", {id:"spinnerText", text:"Saving"});
        this.overlay.appendChild(this.text);
        document.body.appendChild(this.overlay);

        this.delay = 150;
        this.spin = 0;
        this.shouldOpen = false;
    }
    open(text="Saving"){
        this.shouldOpen = true;
        this.text.textContent = text;
        setTimeout(()=>{
            if(this.shouldOpen){
                this.overlay.style.display = "flex";
                this.interval = setInterval(()=>{
                    this.spinner.style.setProperty("--deg", `${this.spin}deg`);
                    this.spin+=1;
                    if(this.spin > 36000)this.spin = 0;
                },5);
            }
        },this.delay);
    }
    close(){
        this.overlay.style.display = "none";
        this.shouldOpen = false;
        clearInterval(this.interval);
        this.spin = 0;
    }
}

startGetFetch = (route, fun, waiter=null) =>{
    fetch(route, {method: "get",headers: {'Content-Type': 'application/json'}})
    .then(response =>{
        if(waiter)waiter.close();
        if(response.status == 200)return response.json();
        else throw new Error("Fetch error");
    })
    .then(data => {
        if(data.status == 200)fun(data);
        else throw new Error(data.statusText);
    })
    .catch(error => {
        console.log(error);
    });
}

startPostFetch = (route, content, fun, waiter=null) =>{
    fetch(route, {method: "post", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(content)})
    .then(response =>{
        if(waiter)waiter.close();
        if(response.status == 200) return response.json();
        else throw new Error("Fetch error");
    })
    .then(data => {
        if(data.status == 200) fun(data);
        else throw new Error(data.statusText);
    })
    .catch(error => {
        console.log(error);
    });
}

/*******HTML creation elements*******/
createElement = (type,data={}) =>{
    let ele = document.createElement(type);
    if(data.classList)ele.classList = data.classList;
    if(data.id)ele.id = data.id;
    if(data.text)ele.textContent = data.text;
    if(data.role)ele.role = data.role;
    if(data.type)ele.type = data.type;
    if(data.name)ele.name = data.name;
    if(data.value)ele.value = data.value;
    if(data.type)ele.type = data.type;
    if(data.placeholder)ele.placeholder = data.placeholder;
    if(data.min)ele.min = data.min;
    if(data.max)ele.max = data.max;
    if(data.title)ele.title = data.title;
    if(data.src)ele.src = data.src;
    if(data.alt)ele.alt = data.alt;

    if(type=="input" && data.classList.includes("numFocus"))addInputListeners(ele);

    return ele;
}

/******A helper screen for slower internet connections, will 'freeze' the screen while a server action is occuring*******/
let waiter = new Waiter();

calcPerc = () =>{
    let h = document.documentElement, 
    b = document.body,
    st = 'scrollTop',
    sh = 'scrollHeight';

    return (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
}
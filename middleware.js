checkAuthentication = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/auth/login");
    }
}

checkUnAuthenticated = (req, res, next) => {
    if(!req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/admin");
    }
}

checkAdmin = (req, res, next) =>{
    if(req.user.permissionLevel != "undefined" && req.user.permissionLevel === 0){
        return next();
    }else{
        res.redirect("/");
    }
}

checkPhone = (req,res,next)=>{
    if(req.device.type == "phone"){
        res.redirect("/mobile");
    }else{
        next();
    }
}

module.exports = {
    checkAuthentication,
    checkUnAuthenticated,
    checkAdmin,
    checkPhone
}
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

module.exports = {
    checkAuthentication: checkAuthentication,
    checkUnAuthenticated: checkUnAuthenticated,
    checkAdmin: checkAdmin
}

errorLog = (e,req,res,message,redirect="none") => {
    console.log(`ERROR: ${e}`);
    req.flash("error",message);
    if(redirect != "none"){
        res.redirect(redirect);
        return true;
    }
}

render = (req, res, target, json={}) =>{
    res.render(target, Object.assign({
        user:req.user,
        message:req.flash()
    },json));
}

module.exports = {
    errorLog,
    render
}
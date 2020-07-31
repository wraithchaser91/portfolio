const router = require("express").Router();
const passport = require("passport");
const {checkUnAuthenticated} = require("../middleware");
const {render} = require("../utils");

router.get("/login", checkUnAuthenticated, async(req,res)=>{
    render(req,res,"admin/login",{css:["admin/main","admin/login"]});
});

router.post("/login", checkUnAuthenticated, passport.authenticate("local",{
    successRedirect: "/admin",
    failureRedirect: "/auth/login",
    failureFlash: true
}));

module.exports = router;
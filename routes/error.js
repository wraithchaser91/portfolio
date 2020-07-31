const router = require("express").Router();
const {render} = require("../utils");

router.get("/404", (req,res)=>{
    render(req,res,"error/404",{css:["error"]});
});

module.exports = router;
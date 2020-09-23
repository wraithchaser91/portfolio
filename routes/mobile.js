const express = require("express");
const router = express.Router();

router.get("/", (req,res)=>{
    render(req,res,"mobile",{css:["mobile"]});
});

module.exports = router;
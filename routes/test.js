const express = require("express");
const router = express.Router();

router.get("/", (req, res) =>{
    res.render("test", {css:"admin/main"});
})

module.exports = router;
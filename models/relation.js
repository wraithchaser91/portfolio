const mongoose = require("mongoose");

const relationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    template:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: "Template"
    }
});

module.exports = mongoose.model("Relation", relationSchema);
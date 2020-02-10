const mongoose = require("mongoose");

const cssSchema = new mongoose.Schema({
        element:{
            type:[String],
            default: undefined,
            required: true
        }
    });

module.exports = mongoose.model("CSS", cssSchema);
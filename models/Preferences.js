const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema({
    pageList:{
        type: [String],
        default: undefined,
        required: true
    },
    featureList:{
        type: [String],
        default: undefined,
        required: true
    },
    groupList:{
        type: [String],
        default: undefined,
        required: true
    }
});

module.exports = mongoose.model("Prefs", preferenceSchema);
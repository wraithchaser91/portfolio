const mongoose = require("mongoose");

const websiteSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    url:{
        type: String,
        required: true
    },
    howItWasMade:{
        type:String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    group:{
        type:String
    },
    fileName:{
        type: String,
        required: true
    },
    liveDate:{
        type: Date,
        required: true
    },
    pageList:{
        type: [String],
        default: undefined,
        required:true
    },
    featureList:{
        type: [String],
        default: undefined,
        required: true
    },
    imageFileNames:{
        type:[String],
        default: undefined,
        required: true
    },
    state:{
        type: Number,
        required: true
    },
    primaryFont:{
        type: String,
        required: true
    },
    secondaryFont:{
        type: String,
        required: true
    },
    primaryColour:{
        type: String,
        required: true
    },
    secondaryColour:{
        type: String,
        required: true
    },
});

module.exports = mongoose.model("Website", websiteSchema);
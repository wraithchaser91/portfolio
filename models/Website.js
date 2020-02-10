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
    images:{
        type:[Buffer],
        default: undefined,
        required: true
    },
    imageTypes:{
        type:[String],
        default: undefined,
        required: true
    },
    css:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "CSS"
    }
});

websiteSchema.virtual('imagePath').get(function() {
    if (this.images != null && this.imageTypes != null) {
        let list = [];
        for(let i = 0; i < this.images.length; i++){
            list.push(`data:${this.imageTypes[i]};charset=utf-8;base64,${this.images[i].toString('base64')}`);
        }
      return list;
    }
})

module.exports = mongoose.model("Website", websiteSchema);
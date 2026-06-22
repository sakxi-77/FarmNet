const mongoose = require('mongoose');

var FarmerSchema = mongoose.Schema({

    fname:{
        type: String,
        // required: true
    },
    mname:{
        type: String,
        // required: true
    },
    lname:{
        type: String,
        // required: true
    },
    gender:{
    	type: String,
    	// required: true
    },
    mobno:
    {
        type:Number,
        // required:true
    },
    dob:{
    	type: Date,
    	// required: true
    },
    aadhar:
    {
        type:String
    },
    image:{
        type:String
    },
    address:{
    	type: String,
    	// required: true
    },
    password:{type:String},
    pincode:{type:Number},
    surveyno:{
        type:Number
    },
    cropname:{
        type:String
    },
    cropyield:
    {
        type:Number
    },
    season:{type:String},
    income:{type:String},
    area:{type:String},
    district:{type:String}
    
});

module.exports = mongoose.model('farmers', FarmerSchema);
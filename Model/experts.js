const mongoose = require('mongoose');

var ExpertSchema = mongoose.Schema({

    fname:{
        type: String,
        // required: true
    },
    username:{
        type:String,
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
    profile:
    {
        type:String
    },
    education:
    {
        type:String,
        // required:true
    },
    email:{
        type: String,
        // required: true
    },
    password:
    {
        type:String
    }  
});

module.exports = mongoose.model('experts', ExpertSchema);
const mongoose = require('mongoose');

var OfficialSchema = mongoose.Schema({

    fname:{
        type: String,
        // required: true
    },
    lname:{
        type: String,
        // required: true
    },
    mobno:
    {
        type:String,
        // required:true
    },
    workarea:
    {
        type:String,
        // required:true
    },
    image:
    {
        type:String
    },
    email:{
        type: String,
        // required: true
    },
    gender:{
    	type: String,
    	// required: true
    },
    password:
    {
        type:String
    }  
});

module.exports = mongoose.model('officials',OfficialSchema);
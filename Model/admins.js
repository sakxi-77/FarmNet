const mongoose = require('mongoose');

var AdminSchema = mongoose.Schema({

    username:{
        type: String,
        // required: true
    },
    
    password:
    {
        type:String
    }  
});

module.exports = mongoose.model('admins', AdminSchema);
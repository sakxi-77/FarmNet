const mongoose = require('mongoose');

var comments=mongoose.Schema({
    title:{
        type:String,
    },
    personaadhar:{
        type:String,
    },
    personname:{
        type:String,
    },
    message:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    },

});
module.exports = mongoose.model('comments', comments);
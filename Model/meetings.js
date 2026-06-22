const mongoose = require('mongoose');

var MeetingSchema = mongoose.Schema({

    speakername:{
        type:String,
        required:true
    },
    date_time:{
        type:String,
        required:true
    },
    venue:{
        type:String,
        required:true
    },
    message:
    {
        type:String,
        required:true
    }
});  
module.exports = mongoose.model('meetings', MeetingSchema);
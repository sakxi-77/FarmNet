const mongoose = require('mongoose');


var InnovationSchema = mongoose.Schema({

    owner:{
        type:String,
    },
    title:{
        type:String,
        unique:true
    },
    login_id:{
        type:String,
    },
    date:{
        type:Date,
        default:Date.now()
    },
    type:
    {
        type:String,
    },
    image:
    {
        type:String,
    },
    video:
    {
        type:String,
    },
    audio:
    {
        type:String,
    },
    des:
    {
        type:String,
        required:true,
    },

});  
module.exports = mongoose.model('innovations', InnovationSchema);
var express = require('express');
var app = express.Router();

app.get('/login',(req,res)=>{

    res.render('./login');
}).get('/message',(req,res)=>{

    res.render('./expert/blog');

}).get('/single-post',(req,res)=>{


    res.render('./expert/single-post');
}).get('/post/:number',(req,res)=>{
 res.send(req.params.number)
}).get('/single-post',(req,res)=>{
res.render('./expert/single-post')
}).get('/',(req,res)=>{


    res.render('.//expert/index')
})

module.exports = app;
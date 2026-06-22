var express = require('express');
var app = express();
// var route=require('./expert');
// var route2=require('./official');
app.set('view engine','ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());
app.use(express.static('static'));

app.get('/', (req, res)=> {
    res.render('index');
});
app.get('/expert/index',(req,res)=>{
    res.render('expert/blog');
    
});

app.get('/expert/',(req,res)=>{
    res.render('expert/login');  
});
app.get('/expert/single-post',(req,res)=>{
    res.render('/expert/single-post');  
});
app.get('/official/',(req,res)=>{
    res.render('/official/index');  
});
app.get('/official/meeting',(req,res)=>{
    res.render('/official/meeting');  
});
app.get('/official/landShow',(req,res)=>{
    res.render('/official/landShow');  
});
app.get('/official/meeting',(req,res)=>{
    res.render('/official/meeting');  
});
// app.use('/expert',route);
// app.use('/official',route2);
 
app.get('/:page',(req,res)=>{
     res.render(req.params.page);
     
 });
 
// app.get('/expert/:page', (req, res) => {
// 	res.render(req.params.page);
// });

app.listen(8080);

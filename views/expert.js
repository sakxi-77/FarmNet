var express = require('express');
var mongoose=require('mongoose');
var  bodyParser = require('body-parser');
const multer= require('multer');
const session = require('express-session');
var app = express();

app.use(bodyParser.urlencoded({extended:true}));
const post= require('./Model/innovations');
const expert= require('./Model/experts');
app.use(bodyParser.json());

app.use(session({
	secret: 'abc'
}))

app.use(express.static('public'));

app.set('view engine','ejs');

mongoose.connect('mongodb://127.0.0.1:27017/demodb',{ useNewUrlParser: true});

const storage = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

const upload = multer({
   storage: storage
}).fields([
	{name:'image',maxCount:1},
	{name:'video',maxCount:1},
	{name:'audio',maxCount:1}
])

app.post('/cregister',(req,res)=>{
   // var img;
	upload(req,res,(err)=>{
		 if(err){
			res.send(err);
		}
		else{
			req.body.owner=req.session.user;
			req.body.image=	req.files.image[0].filename;
			req.body.video=	req.files.video[0].filename;
			req.body.audio=	req.files.audio[0].filename;
			 var data= new post(req.body);
			data.save(function(err){
				if(err) res.send(err);
				else{
						res.render('./expert/addInnovation');
					}
			})
		 }
	 });
});

app.get('/detail/:name',(req,res)=>{
	//var name = "<%= title %>";
//console.log(name);
if(req.session.user){
	var user = req.session.user;  
	const usnm = req.params.name;
	//console.log(usnm);
	post.findOne({title: usnm},(err,data)=>{
		if(data){
			res.render('./expert/single-post',{post:data,expert:user});
		}
	})

	//res.render('./expert/blog',{post:{username:user.name}});
}
else{
	var resp =`
	<script> alert('log in first');window.location.href='/expert/login';</script>
	`;
	res.send(resp);   
}
	
});

app.post('/clogin',(req,res)=>{
	const usnm = req.body.username;
	const passwd= req.body.password;
	expert.findOne({fname: usnm},(err,data)=>{
		if(data){
			req.session.user = data;
			res.redirect('/expert/');
		}
		else{
			var resp =`
        <script> alert('login Incorrect!');window.location.href='/expert/login';</script>
        `;
        res.send(resp);
		}
	})
});

app.get('/logout',(req,res)=>{
    // res.clearCookie('userdata');
    
    if(req.session.user){
        req.session.destroy((err,data)=>{
            if(err) console.log(err);
            else{
                var succ =`
                <script> alert('successfully logged out');window.location.href='/expert/login';</script>
                `;
                res.send(succ);
            }
        
    });
}
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);
    }
});

app.get('/login',(req,res)=>{
	res.render('./expert/login');
	
}).get('/message',(req,res)=>{
	if(req.session.user){
        var user = req.session.user;  
        res.render('./expert/blog',{expert:{username:user.fname}});
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
}).get('/single-post',(req,res)=>{
	if(req.session.user){
        var user = req.session.user;  
        res.render('./expert/single-post',{expert:{username:user.fname}});
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
   
}).get('/post/:number',(req,res)=>{
	if(req.session.user){
		var user = req.session.user; 
		res.send(req.params.number); 
       // res.render('./expert/single-post',{post:{username:user.name}});
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
 
 
}).get('/innovate',(req,res)=>{
	if(req.session.user){
        var user = req.session.user;  
        res.render('./expert/addInnovation',{expert:{username:user.fname}});
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}

}).get('/',(req,res)=>{
	if(req.session.user){
		var user = req.session.user;
		post.findOne({},(err,data)=>{
			if(data){
				res.render('./expert/index',{post:data});
			}
		})  
        //res.render('./expert/addInnovation',{post:{username:user.name}});
    }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
	
});

module.exports = app;
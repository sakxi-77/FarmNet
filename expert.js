// ---- core requires ----
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');

const app = express();

// ---- middleware ----
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// ---- session (fixed, only once) ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false
}));

// ---- models ----
const post = require('./Model/innovations');
const expert = require('./Model/experts');
const farmer = require('./Model/farmer');
const comments = require('./Model/comments');

// ---- file upload ----
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

const upload = multer({
  storage: storage
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);


app.post('/cregister',(req,res)=>{
   // var img;
	upload(req,res,(err)=>{
		 if(err){
			console.log(err);
            return res.send(err);
		}
		else{
			req.body.owner=req.session.user.fname;
			//console.log(req.session.user.fname);
            req.body.image = req.files.image ? req.files.image[0].filename : "";
            req.body.video = req.files.video ? req.files.video[0].filename : "";
            req.body.audio = req.files.audio ? req.files.audio[0].filename : "";
			var data= new post(req.body);
            data.save(function(err){

                if(err){
                    console.log(err);
                    return res.send(err);
                }

                return res.render('./expert/addInnovation');

            });
		 }
	 });
});
app.post('/addcomment/:title',(req,res)=>{
	if(req.session.user){
        var user = req.session.user;
        req.body.title = req.params.title;
        if((user.username).startsWith('expert_')){
            //req.body.personaadhar=user.username;
            req.body.personname=user.username;
        }
        else{
            req.body.personaadhar=user.aadhar;
            req.body.personname=user.fname;
        }
        
        var data= new comments(req.body);
        data.save(function(err){
            if(err) res.send(err);
            else{
                    res.render('expert/addinnovation')
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

// app.get('/expert/viewuser/:aadhar',(req,res)=>{
// 	if(req.session.user){
// 	const usnm = req.params.aadhar;
// 	farmer.findOne({aadhar: usnm},(err,data)=>{
// 		if(data){
// 			    res.render('expert/user',{farm:data});
//         }})
//         }
//     else{
//         var resp =`
//         <script> alert('log in first');window.location.href='expert/login';</script>
//         `;
//         res.send(resp);   
//     }	
// });

app.get('/viewuser/:aadhar',(req,res)=>{
	if(req.session.user){
	const usnm = req.params.aadhar;
	farmer.findOne({
    aadhar: usnm}, 
    (err, data) => {
		if(data){
			    res.render('./expert/user',{farm:data});
        }})
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
    }	
});

app.get('/detail/:name',(req,res)=>{
	if(req.session.user){
	var user = req.session.user;  
	const usnm = req.params.name;
	post.findOne({title: usnm},(err,data)=>{
		if(data){
            comments.find({title:usnm},(err, msg)=> {
            res.render('./expert/single-post',{post:data,expert:user,farmer:user,comments:msg});
        })
        }
	})
}
else{
	var resp =`
	<script> alert('log in first');window.location.href='/expert/login';</script>
	`;
	res.send(resp);   
}	
});


// app.get('/detail/:name',(req,res)=>{
// 	//var name = "<%= title %>";
// //console.log(name);
// if(req.session.user){
// 	var user = req.session.user;  
// 	const usnm = req.params.name;
// 	//console.log(usnm);
// 	post.findOne({title: usnm},(err,data)=>{
// 		if(data){
// 			res.render('./expert/single-post',{post:data,expert:user});
// 		}
// 	})
// }
// else{
// 	var resp =`
// 	<script> alert('log in first');window.location.href='/expert/login';</script>
// 	`;
// 	res.send(resp);   
// }
	
// });

app.post('/clogin', (req, res) => {

    const usnm = req.body.aadhar;
    const passwd = req.body.password;

    farmer.findOne(
        {
            aadhar: usnm,
            password: passwd
        },
        (err, data) => {

            if (err) {
                console.log(err);
                return res.send(err);
            }

            if (data) {
                req.session.user = data;
                return res.redirect('/profile');
            }

            return res.send(`
                <script>
                    alert('Invalid Aadhaar or Password');
                    window.location.href='/login';
                </script>
            `);

        }
    );

});

app.get('/logout',(req,res)=>{
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

})

.get('/queryblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        console.log(user);
		post.find({type:'Query'},(err, data)=> {
            if(data)
            {console.log(data);
            res.render('expert/index',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='expert/login';</script>
        `;
        res.send(resp);   
	}
    //res.render('blog')
})

.get('/myblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        //console.log(user);
		post.find({owner:user.fname},(err, data)=> {
            if(data)
            {//console.log(data);
            res.render('expert/index',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='expert/login';</script>
        `;
        res.send(resp);   
	}
    
})

.get('/single-post',(req,res)=>{
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

}).get('/innovationblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        console.log(user);
		post.find({type:'Innovation'},(err, data)=> {
            if(data)
            {console.log(data);
            res.render('./expert/index',{post:data,expert:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
    //res.render('blog')
}).get('/',(req,res)=>{
	if(req.session.user){
		var user = req.session.user;

		post.find({},(err, data)=> {
        
			res.render('./expert/index',{post:data});
		  })
	}
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/expert/login';</script>
        `;
        res.send(resp);   
	}
	
});

module.exports = app;
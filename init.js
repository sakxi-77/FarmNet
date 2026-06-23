// ---- env & core requires ----

const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env at:', envPath, 'exists?', fs.existsSync(envPath));

require('dotenv').config({ path: envPath, debug: true });

// don’t print the whole URI (it has your password); show length instead
console.log('MONGO_URI present?', !!process.env.MONGO_URI, 'len:', (process.env.MONGO_URI || '').length);

// ---- core modules ----
const express = require('express');
const axios = require('axios');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');


// ---- models & routes ----
const route = require('./expert');
const route2 = require('./official');
const route3 = require('./admin');
const farmer = require('./Model/farmer');
const meeting = require('./Model/meetings');
const comments = require('./Model/comments');
const post = require('./Model/innovations');
const expert = require('./Model/experts');


// ---- middleware ----
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ---- database connection ----
//mongoose.connect(process.env.MONGO_URI, {
 // useNewUrlParser: true,
  //useUnifiedTopology: true
//})
//.then(() => console.log('✅ MongoDB connected successfully'))
//.catch(err => console.error('❌ MongoDB connection error:', err));

// ---- routes ----


const storage = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
	}
});

const storage1 = multer.diskStorage({
    destination : './public/uploads',
    filename: function(req, file, callback) {
        callback(null,file.originalname);
	}
});
const upload = multer({
   storage: storage
}).fields([
	{name:'image',maxCount:1},
	{name:'video',maxCount:1},
	{name:'audio',maxCount:1}
])
const upload1 = multer({
    storage: storage1
 }).single('image')

app.use(express.static('static'));
//app.use('/expert',route);
//app.use('/official',route2);
//app.use('/admin',route3);

app.post('/innregister',(req,res)=>{

    upload(req,res,(err)=>{

        if(err){

            console.log(err);
            res.send(err);

        }

        else{

            console.log(req.body);
            console.log(req.files);

            req.body.owner = req.session.user.fname;

            if(req.files && req.files.image){

                req.body.image = req.files.image[0].filename;

            } else {

                req.body.image = "";

            }

            if(req.files && req.files.video){

                req.body.video = req.files.video[0].filename;

            } else {

                req.body.video = "";

            }

            if(req.files && req.files.audio){

                req.body.audio = req.files.audio[0].filename;

            } else {

                req.body.audio = "";

            }

            var data = new post(req.body);

            data.save(function(err){

                if(err){

                    console.log(err);
                    res.send(err);

                }

                else{

                    res.redirect('/blog');

                }

            });

        }

    });

});
app.get('/',(req,res)=>{
    res.render('FarmNet Render Test')

});
app.get('/single-post',(req,res)=>{
    res.render('single-post')

});
app.get('/blog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
       var number= post.find().count();
       console.log(number);
		post.find({},(err, data)=> {
        
			res.render('blog',{post:data,farmer:user});
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
    //res.render('blog')
});
app.get('/myblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        //console.log(user);
		post.find({owner:user.fname},(err, data)=> {
            if(data)
            {//console.log(data);
            res.render('blog',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
});
app.get('/deletePost/:id', (req,res)=>{

    if(req.session.user){

        post.findByIdAndDelete(
            req.params.id,

            (err)=>{

                if(err){

                    console.log(err);
                    res.send("Delete failed");

                }

                else{

                    res.redirect('/myblog');

                }

            }
        );

    }

    else{

        var resp = `
        <script>
            alert('Login First');
            window.location.href='/login';
        </script>
        `;

        res.send(resp);

    }

});

app.get('/sakshi-delete-test',(req,res)=>{
    res.send("DELETE ROUTE SECTION WORKING");
});

app.get('/innovationblog',(req,res)=>{
    if(req.session.user){
        var user = req.session.user;
        console.log(user);
        post.find({
        
            owner:user.fname,
            type:/innovation/i
        
        },(err, data)=> {
            if(data)
            {console.log(data);
            res.render('blog',{post:data,farmer:user});}
            else
            res.send("no posts yet!");
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
	}
});
app.get('/queryblog',(req,res)=>{

    if(req.session.user){

        var user = req.session.user;

        post.find({

            owner:user.fname,
            type:/query/i

        },(err, data)=> {

            if(data){

                res.render('blog',{post:data,farmer:user});

            }

            else{

                res.send("no query posts yet!");

            }

        })

    }

    else{

        var resp =`
        <script>
            alert('log in first');
            window.location.href='login';
        </script>
        `;

        res.send(resp);

    }

    //res.render('blog')
});
app.get('/index',(req,res)=>{
    res.render('index')

});
app.get('/newInnovation',(req,res)=>{
    res.render('newInnovation');
});
app.get('/farmerregistration',(req,res)=>{
    res.render('farmerregistration');
});


app.post('/cregister',(req,res)=>{
    
    upload1(req,res,(err)=>{
        if(err){
           res.send(err);
       }
       else{
          // req.body.owner=req.session.user.fname;
          console.log(req.body.image);
           //req.body.image=req.file.filename1;
           
    var data= new farmer(req.body);
    data.save(function(err){
        if(err) res.send(err);
        else{
                res.render('login');
        }
})
       }
    })
})


app.get('/notifications',(req,res)=>{
    if(req.session.user){
		var user = req.session.user;
		meeting.find({},(err, data)=> {
        
			res.render('notification',{meeting:data});
          })
        }
    else{
        var resp =`
        <script> alert('log in first');window.location.href='login';</script>
        `;
        res.send(resp);   
    }
});

app.get('/detail/:id',(req,res)=>{

    if(req.session.user){

        var user = req.session.user;

        post.findById(req.params.id,function(err,data){

            if(err){
                console.log(err);
                return res.send(err);
            }

            if(!data){
                return res.send("Post not found");
            }

            comments.find({postid:req.params.id},function(err,msg){

                if(err){
                    console.log(err);
                    return res.send(err);
                }

                res.render('single-post',{
                    post:data,
                    comments:msg,
                    farmer:user
                });

            });

        });

    }

    else{

        var resp = `
        <script>
            alert('Login First');
            window.location.href='/login';
        </script>
        `;

        res.send(resp);

    }

});

app.post('/addcomment/:id',(req,res)=>{

    if(req.session.user){

        var user = req.session.user;

        req.body.title = req.params.id;
        req.body.personaadhar = req.session.user.aadhar;
        req.body.personname = user.fname;

        var data = new comments(req.body);

        data.save(function(err){

            if(err){

                console.log(err);
                res.send(err);

            }

            else{

                res.redirect('/detail/' + req.params.id);

            }

        });

    }

    else{

        var resp = `
        <script>
            alert('Login First');
            window.location.href='/login';
        </script>
        `;

        res.send(resp);

    }

});

app.get('/viewpost/:id',(req,res)=>{

    if(req.session.user){

        var user = req.session.user;

        post.findById(req.params.id,(err, pdata)=>{

            if(err || !pdata){

                res.send("Post not found");

            }

            else{

                comments.find({ postid:req.params.id },(err, cdata)=>{

                    if(err){

                        console.log(err);
                        res.send(err);

                    }

                    else{

                        res.render('single-post',{

                            post:pdata,
                            comments:cdata,
                            farmer:user

                        });

                    }

                });

            }

        });

    }

    else{

        var resp = `
        <script>
            alert('Login First');
            window.location.href='/login';
        </script>
        `;

        res.send(resp);

    }

});

app.post('/clogin',(req,res)=>{
	const usnm = req.body.aadhar;
	const passwd= req.body.password;
	farmer.findOne({aadhar: usnm},(err,data)=>{
		if(data){
			req.session.user = data;
			res.redirect('/profile');
		}
		else{
			var resp =`
        <script> alert('login Incorrect!');window.location.href='/login';</script>
        `;
        res.send(resp);
		}
	})
});

app.get('/logout',(req,res)=>{
     if(req.session.user){
        req.session.destroy((err,data)=>{
            if(err) console.log(err);
            else{
                var succ =`
                <script> alert('successfully logged out');window.location.href='/login';</script>
                `;
                res.send(succ);
            }
        
    });
}
    else{
        var resp =`
        <script> alert('log in first');window.location.href='/login';</script>
        `;
        res.send(resp);
    }
});

app.get('/viewuserr/:aadhar',(req,res)=>{
	if(req.session.user){
	//var user = req.session.user;  
	const usnm = req.params.aadhar;
	farmer.findOne({aadhar: usnm},(err,data)=>{
		if(data){
			    res.render('userfar',{farm:data});
        }})
        }
	

else{
	var resp =`
	<script> alert('log in first');window.location.href='login';</script>
	`;
	res.send(resp);   
}	
});
app.get('/home',(req,res)=>{
    res.render('home');
})  

app.get('/login',(req,res)=>{
	res.render('login');
})	

app.post("/predict", async (req, res) => {

    try {

        console.log("📥 Form Data:", req.body);

        // Send data to Flask API
        const response = await axios.post(
            "http://127.0.0.1:5000/predict",
            {
                N: req.body.N,
                P: req.body.P,
                K: req.body.K,
                temperature: req.body.temperature,
                humidity: req.body.humidity,
                ph: req.body.ph,
                rainfall: req.body.rainfall
            }
        );

        console.log("✅ ML Prediction:", response.data);

        // Show result on page
        res.render("predict", {
            prediction: response.data.predicted_crop
        });

    } catch (error) {

        console.log("❌ ERROR:");
        console.log(error.message);

        res.send("Prediction Error");
    }

});

// ================= CONTACT FORM ROUTE =================
app.post("/contact", (req, res) => {
    try {
        const { name, email, message } = req.body;

        console.log("📩 Contact Form Data:");
        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Message:", message);

        // For now just testing (no email yet)
        res.send("Message received successfully!");

    } catch (err) {
        console.log(err);
        res.send("Error occurred");
    }
});

app.get('/predict-page', (req, res) => {
  res.render('predict');
});

app.get('/farmer-tips', (req, res) => {
    res.render('FarmerTips');
});
app.get('/test123', (req, res) => {
    res.send("TEST ROUTE WORKING");
});

app.get('/profile', (req, res) => {

    if(req.session.user){

        const user = req.session.user;

        res.render('profile', { user:user });
        
    } else {

        var resp = `
        <script>
            alert('Login first');
            window.location.href='/login';
        </script>
        `;

        res.send(resp);
    }

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
}).on("error", (err) => {
    console.log("❌ Server Error:", err);
});



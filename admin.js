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
app.use(express.static('static'));
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
const official = require('./Model/official');
const farmer = require('./Model/farmer');
const admins = require('./Model/admins');
const comments = require('./Model/comments');

// ---- file upload ----
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('image');

// ---- routes ----
app.post('/rregister', (req, res) => {
  var data = new official(req.body);
  data.save(function (err) {
    if (err) res.send(err);
    else res.render('./admin/addofficial');
  });
});

app.post('/eregister', (req, res) => {
  var user = "expert_";
  var expert1 = user.concat(req.body.fname);
  req.body.username = expert1;
  console.log(expert1);

  var data = new expert(req.body);
  data.save(function (err) {
    if (err) res.send(err);
    else res.render('./admin/addexpert');
  });
});

app.get('/delete/:usnm', (req, res) => {
  if (req.session.user) {
    const usnm = req.params.usnm;
    post.deleteOne({ title: usnm }, (err, data) => {
      if (data) res.render('./admin/');
    });
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/detail/:name', (req, res) => {
  if (req.session.user) {
    const usnm = req.params.name;
    post.findOne({ title: usnm }, (err, data) => {
      if (data) {
        comments.find({ title: usnm }, (err, msg) => {
          res.render('admin/single-post', { post: data, farmer: req.session.user, comments: msg });
        });
      }
    });
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.post('/clogin', (req, res) => {
  const usnm = req.body.username;
  const passwd = req.body.password;

  admins.findOne({ 'username': usnm }, (err, data) => {
    if (data) {
      req.session.user = data;
      res.redirect('/admin/addofficial');
    } else {
      var resp = `
        <script> alert('login Incorrect!');window.location.href='/admin/login';</script>
      `;
      res.send(resp);
    }
  });
});

app.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) console.log(err);
      else {
        var succ = `
          <script> alert('successfully logged out');window.location.href='/admin/login';</script>
        `;
        res.send(succ);
      }
    });
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/login', (req, res) => {
  res.render('./admin/login');
});

app.get('/addofficial', (req, res) => {
  if (req.session.user) {
    res.render('./admin/addofficial');
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/addexpert', (req, res) => {
  if (req.session.user) {
    res.render('./admin/addexpert');
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/post/:number', (req, res) => {
  if (req.session.user) {
    res.send(req.params.number);
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/', (req, res) => {
  if (req.session.user) {
    post.find({}, (err, data) => {
      res.render('admin/', { post: data, farmer: req.session.user });
    });
  } else {
    var resp = `
      <script> alert('log in first');window.location.href='/admin/login';</script>
    `;
    res.send(resp);
  }
});

module.exports = app;

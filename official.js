// ---- core requires ----
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// ---- middleware ----
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.static('static')); // ✅ optional but consistent with other routes
app.set('view engine', 'ejs');

// ---- session (use .env; no deprecations) ----
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false
}));

// ---- models ----
const farmers = require('./Model/farmer');
const meetings = require('./Model/meetings');
const official = require('./Model/official');

// ✅ Database connection is handled in init.js — do NOT reconnect here.

// ---- routes ----

// Register or update farmer
app.post('/cregister', (req, res) => {
  if (req.session.user) {
    const data = new farmers(req.body);

    // ✅ Use modern Mongoose method updateOne()
    farmers.updateOne({ aadhar: data.aadhar }, data, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Database error');
      } else if (result) {
        console.log(result);
        res.redirect('/official/show');
      } else {
        res.send("No posts yet!");
      }
    });
  } else {
    res.send(`
      <script>alert('log in first');window.location.href='/official/login';</script>
    `);
  }
});

// Logout route
app.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) console.log(err);
      else {
        const succ = `
          <script>alert('successfully logged out');window.location.href='/official/login';</script>
        `;
        res.send(succ);
      }
    });
  } else {
    const resp = `
      <script>alert('log in first');window.location.href='/official/login';</script>
    `;
    res.send(resp);
  }
});

// Add meeting
app.post('/addMeeting', (req, res) => {
  const data = new meetings(req.body);
  data.save((err) => {
    if (err) res.send(err);
    else res.render('./official/meeting');
  });
});

// Login
app.post('/clogin', (req, res) => {
  const usnm = req.body.username;
  const passwd = req.body.password;

  // ✅ Updated query (assuming username is used for login)
  official.findOne({ username: usnm }, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Database error');
    } else if (data) {
      req.session.user = data;
      res.redirect('/official/');
    } else {
      const resp = `
        <script>alert('login Incorrect!');window.location.href='/official/login';</script>
      `;
      res.send(resp);
    }
  });
});

// ---- view routes ----
app.get('/index', (req, res) => {
  res.render('./index');
});

app.get('/login', (req, res) => {
  res.render('./official/login');
});

app.get('/landRegistration', (req, res) => {
  if (req.session.user) {
    res.render('./official/landRegistration');
  } else {
    const resp = `
      <script>alert('log in first');window.location.href='/official/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/show', (req, res) => {
  if (req.session.user) {
    farmers.find({}, (err, messages) => {
      if (err) {
        console.error(err);
        res.status(500).send('Database error');
      } else {
        res.render('./official/landshow', { farmers: messages });
      }
    });
  } else {
    const resp = `
      <script>alert('log in first');window.location.href='/official/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/meeting', (req, res) => {
  if (req.session.user) {
    res.render('./official/meeting');
  } else {
    const resp = `
      <script>alert('log in first');window.location.href='/official/login';</script>
    `;
    res.send(resp);
  }
});

app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('./official/index');
  } else {
    const resp = `
      <script>alert('log in first');window.location.href='/official/login';</script>
    `;
    res.send(resp);
  }
});

module.exports = app;

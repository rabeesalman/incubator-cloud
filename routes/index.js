const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
// Load User model
const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { JsonWebTokenError } = require('jsonwebtoken');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  const token = jwt.sign(req.user.email, 'top-secret');
  res.render('dashboard', {
    user: req.user,
    token: token
  });
  User.findOne({ email: req.user.email }).then(user => {
    user.token = token;
    user.save().then(console.log('token saved')).catch(err => console.log(err));
  }).catch(err => console.log(err));
});

// Websocket
router.get('/ws', ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then(user => {
    res.render('ws', {
      token: user.token
    });
  }).catch(err => console.log(err));
});


module.exports = router;

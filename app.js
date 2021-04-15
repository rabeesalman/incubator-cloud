const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const Connection = require('./models/Connection');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);
// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));





io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);
// Load Connection model
const conn = new Connection();
  // handle the event sent with socket.send()

  socket.on('chat', msg => {
    console.log('message from ( ' + socket.id + ' ): ' + msg);
  });

  socket.on('payload', payload => {   
    if (payload.client === 'device') {
      console.log('ESP connected');
    } 
    conn.connection = socket.id;
    conn.token = payload.token;
    conn.save().then(() => console.log('connection saved!')).catch((err) => console.log(err));
    console.log('token from ( ' + socket.id + ' ): ' + payload.token);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected: ' + socket.id);
    conn.delete().then(() => console.log('connection deleted!')).catch((err) => console.log(err));
  });

});

const PORT = process.env.PORT || 5050;

http.listen(PORT, console.log(`Server running on  ${PORT}`));

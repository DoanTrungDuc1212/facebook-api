const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');


global.globalAccessToken = null;
global.globalversion = "v19.0";
const routes = require('./routes'); 

const app = express();

 

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url,
    enableProof: true
  },
  function(accessToken, refreshToken, profile, done) {
    global.globalAccessToken = accessToken; 
    process.nextTick(function () {
      console.log(accessToken, refreshToken, profile);
      global.userId = profile.id;
      return done(null, profile);
    });
  }
));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'keyboard cat',
  key: 'sid',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

const port = 3000;
app.listen(port, () => {
  console.log("Server started on port:", port);
});

const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');
const app = express();

global.globalAccessToken = "EAAGlXQeuJRABOZB7ZAZCGZCEDsRbLNGcvGt82CrefhVvZB3ZAumhHJxO6np279NVUSsWqdWvxRm93XKDj2TxPXOMm3emuWPbTLzDs5efixxgWhQCZCCx5viV7iLqZAlqEnfFTRDmlnsz5ZATzLWKxK0hN8Ta9faBP0XZBxVLHiAagMJEaRT4tZA7megZAO4pDbIyZCXpCaaExQw4BswZDZD";
global.globalversion = "v20.0";
global.globalAdAccountId = null;
global.globalPageId= null;
global.globalPageAccessToken=null
global.globalBusinessId=null
global.globalCampainId=null
global.globalAdId = null
global.globalAdSetId = null
const routes_1 = require('./api_facebook'); 
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
      return done(null, profile);
    });
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use('/', routes_1);

const port = 3000;
app.listen(port, () => {
  console.log("Server started on port:", port);
});

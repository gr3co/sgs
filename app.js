var express = require('express'),
  exphbs = require('express3-handlebars'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(express),
  flash = require('connect-flash'),
  passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy,
  expressValidator = require('express-validator'),
  env = process.env.NODE_ENV || 'development',
  User = require('./user'),
  Quote = require('./quote'),
  passportSocketIo = require("passport.socketio"),
  twit = require('twitter'),
  fs = require('fs'),
  util = require('util');

GLOBAL.config = require('./config')[env];
var cstore = new MongoStore(config.db);

// create and configure express app
var app = express();

// use handlebar templates with extension .html
var hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.html',
  helpers: {}
});
app.engine('html', hbs.engine);
app.set('view engine', 'html');

app.set('port', config.port);
app.set('title', config.app.name);

// middlewares
app.use(express.logger('dev'));

// compress responses with gzip/deflate
app.use(express.compress());

// validation
app.use(expressValidator());
// cookies
app.use(express.cookieParser());

// parsing
app.use(express.json());
app.use(express.urlencoded());

// use MongoDB to hold session data
app.use(express.session({
  secret: config.cookie.secret,
  maxAge: config.cookie.maxAge,
  store: cstore
}));

// authentication
app.use(passport.initialize());
app.use(passport.session());

// flash message support
app.use(flash());

app.get("/style/layout.css", function(req,res) {
  res.sendfile(config.root + "/public/style/layout.css");
});

if (env === 'development' || env === 'test') {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
} else if (env === 'production') {
  app.use(express.errorHandler());
}

passport.use(new FacebookStrategy({
    clientID: config.fb.appID,
    clientSecret: config.fb.appSecret,
    callbackURL: config.fb.callback,
    enableProof: false
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      User.findOne({facebookId: profile.id}, function(err, user){
        console.log(user);
        if (err){
          return done(err);
        }
        else if (user){
          return done(null,user);
        }
        else {
          var newUser = new User({
            first : profile['_json'].first_name,
            last: profile['_json'].last_name,
            email : profile['_json'].email.toLowerCase(),
            facebookId: profile.id,
          });
          newUser.save(function(err, result){
            if (err){
              return done(err);
            }
            else {
              return done(null, newUser);
            }
          });
          newUser = null;
        }
      });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findOne({ _id: id }, done);
});

GLOBAL.twitter = new twit(config.twitter);
twitter.verifyCredentials(function(data) {
  if (data.id) {
    console.log("Twitter login OK");
  }
});

// attach controller
require('./controller')(app);

function dburl(options) {
  return 'mongodb://' + options.host + '/' + options.db;
}

mongoose.connect(dburl(config.db));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {

  console.log("Database connection open");

  //set up server
  var server = require('http').createServer(app);

  //set up socket.io server
  var io = require('socket.io').listen(server);

  var acceptConnection = function(data, accept) {
    accept(null, true);
  };
  var rejectConnection = function(data, message, error, accept) {
    if (error) {
      console.error("Rejected connection: " + error);
    }
    accept(null, false);
  };

  //force authorization before handshaking
  io.set('authorization', passportSocketIo.authorize({
    cookieParser: express.cookieParser,
    secret: config.cookie.secret,
    store: cstore,
    success: acceptConnection,
    fail: rejectConnection
  }));

  server.listen(app.get('port'));
  console.log("Web server listening on port " + app.get('port'));
});

exports = module.exports = app;

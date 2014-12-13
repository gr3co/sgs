var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Quote = mongoose.model('Quote'),
  _ = require('underscore'),
  passport = require('passport');

// populates handlebars local vars with user, if logged in.
function optionalAuth(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  return next();
}

function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    req.flash('error', "You need to log in to do that.");
    res.redirect('/sgs/');
  }
  res.locals.user = req.user;
  return next();
}

function addQuotes(foo) {
  return foo.indexOf('"') === 0 && foo.lastIndexOf('"') === foo.length -1
    ? foo : "\"" + foo + "\"";
}

module.exports = function(app) {
  
  app.get('/', optionalAuth, function(req, res) {
    Quote.random(function(err, quote) {
      if (err) {
        req.flash('error', err.message);
      }
      res.render('home', {
        errors: req.flash('error'),
        info: req.flash('info'),
        quote: quote ? addQuotes(quote.text) : null
      });
    });
  });

  app.get('/db', optionalAuth, function(req,res) {
    Quote.find({})
      .sort('-created')
      .exec(function(err,quotes) {
        if (err) {
          req.flash('error', err.message);
        }
        res.render('db', {
          errors: req.flash('error'),
          info: req.flash('info'),
          quotes: quotes
        });
      });
  });

  app.post('/quote', function(req,res) {
    if (req.body.quote.length > 140) {
      req.flash('error', "Quote is too long. Please limit to under 140 characters.");
      res.redirect('/sgs/');
    }
    var q = addQuotes(req.body.quote);
    twitter.updateStatus(q, function(data) {
      if (!data.id) {
        req.flash('error', "An unexpected error occurred.");
        res.redirect('/sgs/');
      }
      var quote = new Quote({
        text : q,
        owner : req.body.submitter || "Anonymous",
        twitterId : data['id_str']
      });
      quote.save(function(err){
        if (err) {
          req.flash('error', err.message);
        } else {
          req.flash('info', "Quote successfully saved.");
        }
        res.redirect('/sgs/');
      });
      quote = null;
    });
  });

  app.get('/login', function(req, res) {
    passport.authenticate('facebook');
  });

  app.post('/login/cb',
    passport.authenticate('facebook', { 
        failureRedirect: '/sgs/',
        successRedirect: '/sgs/'
  }));

  app.post('/logout', requireAuth, function(req, res) {
    req.logout();
    res.redirect('/sgs/');
  });

};
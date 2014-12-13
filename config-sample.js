var _ = require('underscore'),

global = {

  root: __dirname,
  app: {
    name: 'APP_NAME'
  },

  // comment out this line if you want to use different ports 
  // for developement & production environments
  port: 3000,

  fb : {
    appID: 'FB_APP_ID',
    appSecret: 'FB_APP_SECRET',
    callback: 'FB_CALLBACK'
  },

  twitter : {
    consumer_key: 'TWITTER_KEY',
    consumer_secret: 'TWITTER_SECRET',
    access_token_key: 'TOKEN_KEY',
    access_token_secret: 'TOKEN_SECRET'
  }
};

development = {
  db: {
    db: 'DEV_DB',
    host: '127.0.0.1'
  },
  cookie: {
    secret: 'development',
    maxAge: 1000 * 60 * 60 * 12
  },
  allowRepl : false
};

production = {
  db: {
    db: 'PROD_DB',
    host: '127.0.0.1'
  },
  cookie: {
    secret: 'COOKIE_SECRET', // change this, obviously
    maxAge: 1000 * 60 * 60 * 12
  },
  allowRepl : false
};

repl = {
  db: {
    db: 'DEV_DB',
    host: '127.0.0.1'
  },
  cookie: {
    secret: 'repl',
    maxAge: 1000 * 60 * 60 * 12
  },
  allowRepl : true
};


module.exports = {
  repl: _.extend({}, global, repl),
  development: _.extend({}, global, development),
  production: _.extend({}, global, production)
};
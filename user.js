var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var userSchema = new Schema({
     username: String,
     first: String,
     last: String,
     email : String,
     created: {type: Date, default: Date.now},
     facebookId: String,
});

module.exports = mongoose.model('User', userSchema, 'users');

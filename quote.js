var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var quoteSchema = new Schema({
  owner: {type: String, default: 'Anonymous'},
  text: {type: String, default: ''},
  created: {type: Date, default: Date.now},
  twitterId: {type: String, default: ''}
});

quoteSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};

module.exports = mongoose.model('Quote', quoteSchema, 'quotes');

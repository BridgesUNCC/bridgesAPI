//Modules used.
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    config = require('./config/config');

//Set up database
var mongoose = require('mongoose');
mongoose.connect(config.db, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

mongoose.set('debug', config.debugmongo);

var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

db.on('connected', function () {
    console.log("Connected to mongodb server");
});

db.on('disconnected', function () {
    console.log("Disconnected to mongodb server");
});

db.on('reconnected', function () {
    console.log("Reconnected to mongodb server");
});


//Bootstrap models.
var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});

//Bootstrap passport
require('./config/passport')(passport, config);

//Bootstrap express
var app = express();
require('./config/express')(app, config, passport);

//compatible with heroku
var port = process.env.PORT || config.port;

var server = app.listen(port);
var io = require('socket.io')(server);
var streamable = require('streamable').streamable(io);

console.log("Server listening on port " + port);


exports = module.exports = app;

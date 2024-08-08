//Configures mongo database depending upon the environment type

var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    // db: process.env.MONGOLAB_URI
      db: 'mongodb://localhost/bridgesapi-development',
      debugmongo: true
  },

  test: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
      db: 'mongodb://localhost/bridgesapi-test',
      debugmongo: true
  },

  production: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    // db: 'mongodb://localhost/bridgesapi-production'
      db: process.env.MONGOLAB_URI,
      debugmongo: false
  }

};




module.exports = config[env];

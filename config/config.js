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
    db: 'mongodb://bridges-db:BiFrost@ds163400-a0.mlab.com:63400,ds163400-a1.mlab.com:63400/bridges-db?replicaSet=rs-ds163400'
    // db: 'mongodb://localhost/bridgesapi-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    db: 'mongodb://localhost/bridgesapi-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'bridgesapi'
    },
    port: 3000,
    // db: 'mongodb://localhost/bridgesapi-production'
    db: 'mongodb://bridges-db:BiFrost@ds163400-a0.mlab.com:63400,ds163400-a1.mlab.com:63400/bridges-db?replicaSet=rs-ds163400'
  }

};


module.exports = config[env];

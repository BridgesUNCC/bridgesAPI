var express = require('express'),
  expressSession = require('express-session'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  compression = require('compression'),
  serveFavicon = require('serve-favicon'),
  serveStatic = require('serve-static'),
  morgan = require('morgan'),
  mongoStore = require('connect-mongo')(expressSession),
  pkg = require('../package.json'),
  flash = require('connect-flash'),
  methodOverride = require('method-override');

module.exports = function (app, config, passport) {

    app.set('showStackError', true);

    app.use(function(req, res, next) {
      res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
      next();
    });

    // should be placed before express.static
    app.use(compression({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    app.use(serveFavicon(config.root + '/public/img/favicon.ico'));
    app.use(serveStatic(config.root + '/public'));

    // don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }

    // set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'pug');

    // expose package.json to views
    // app.use(function (req, res, next) {
    //     res.locals.pkg = pkg;
    //     next();
    // });

    // cookieParser should be above session
    app.use(cookieParser());

    //custom middleware from https://gist.github.com/shesek/4651267
    //to get rawbody from request.
    app.use(function(req, res, next) {
      if (!req.is('text/plain')) {
          return next();
        }
      req.body = '';
      req.on('data', function(data) {
          return req.body += data;
        });
      return req.on('end', next);
    });

    // bodyParser should be above methodOverride
    app.use(bodyParser.urlencoded({limit: '12mb', extended: true}));
    app.use(bodyParser.json({limit: '12mb'}));
    app.use(methodOverride());

    // express/mongo session storage
    app.use(expressSession({
        secret: process.env.SESSION_SECRET || 'noobjs',
        resave: false,
        saveUninitialized: false,
        store: new mongoStore({
            url: config.db,
            collection : 'sessions'
        })
    }));

    // use passport session
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());


    //http://stackoverflow.com/questions/13516898/disable-csrf-validation-for-some-requests-on-express
    // app.use(function (req, res, next) {
    //
    //     needCSRF = false;
    //     if (req.url.indexOf("/assignments")==-1) needCSRF=true;
    //
    //     if (needCSRF) {
    //         express.csrf()(req, res, function () {
    //             res.locals.csrftoken = req.csrfToken();
    //             next ();
    //         });
    //     } else {
    //         next();
    //     }
    // });

    // routes should be at the last
    //Bootstrap routes.
    require('./routes')(app, passport);

    app.use(function(err, req, res, next){
      // treat as 404
      if (err.message &&
            (~err.message.indexOf('not found') ||
            (~err.message.indexOf('Cast to ObjectId failed')))) {
        return next();
      }
      // send emails if you want
      console.error(err.stack);
      // error page
      res.status(404).render('404', { error: err.stack });
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', {
        url: req.originalUrl,
        error: 'Not found'
      });
    });

  // development env config
  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }
};

/**
 * Module dependencies.
 */

const express = require('express');
const session = require('express-session');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const formidable = require('express-formidable');
// const csrf = require('csurf');
const helmet = require('helmet');
const cors = require('cors');

const mongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const winston = require('winston');
const helpers = require('view-helpers');
const config = require('./');
const pkg = require('../package.json');
const {
  STRIPE_CALLBACK_PATH,
  XERO_CALLBACK_PATH
} = require('../app/utils/constants');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function(app, passport) {
  app.use(helmet());

  // Compression middleware (should be placed before express.static)
  app.use(
    compression({
      threshold: 512
    })
  );

  // Static files middleware
  app.use(express.static(config.root + '/public'));

  // Use winston on production
  let log;
  if (env !== 'development') {
    log = {
      stream: {
        write: msg => winston.info(msg)
      }
    };
  } else {
    log = 'dev';
  }

  // Don't log during tests
  // Logging middleware
  if (env !== 'test') app.use(morgan(log));

  // set views path and default layout
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'pug');

  // expose package.json to views
  app.use(function(req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // bodyParser should be above methodOverride

  app.use(/^\/(?!admin).*/, express.urlencoded({ extended: true }));

  //Use formidable for paths that are admin bro and multiparts
  app.use('/admin', formidable());
  // app.use(
  //   '/ahref/upload',
  //   formidable({
  //     multiples: true,
  //     uploadDir: 'uploads'
  //   })
  // );

  app.use(
    [STRIPE_CALLBACK_PATH, XERO_CALLBACK_PATH],
    express.raw({ type: 'application/json' })
  );
  app.use('/api/link_market/save_multiple', express.json({ limit: '5mb' }));
  app.use(/^\/(?!api\/stripe\/webhook).*/, express.json());
  app.use(
    methodOverride(function(req) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        const method = req.body._method;
        delete req.body._method;
        return method;
      }
    })
  );

  // cookieParser should be above session
  app.use(cookieParser());
  app.use(
    session({
      secret: pkg.name,
      proxy: true,
      resave: true,
      saveUninitialized: true,
      store: new mongoStore({
        url: config.db,
        collection: 'sessions'
      })
    })
  );

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // connect flash for flash messages - should be declared after sessions !
  app.use(flash());

  // should be declared after session and flash
  app.use(helpers(pkg.name));

  //add cors
  app.use(
    cors({
      origin: ['http://127.0.0.1']
    })
  );

  // adds CSRF support
  // if (process.env.NODE_ENV !== 'test') {
  //   app.use(/^\/(?!admin).*/, csrf());

  //   // This could be moved to view-helpers :-)
  //   app.use(/^\/(?!admin).*/, function(req, res, next) {
  //     var token = req.csrfToken();
  //     res.cookie('XSRF-TOKEN', token);
  //     res.locals.csrf_token = token;
  //     next();
  //   });
  // }
};

/**
 * Wrapping the app.js file to prevent leakage to the process.
 * Therefore, the only thing that is exported when you require('./app')
 * will be what is returned
 */
module.exports = (function() {
  'use strict';

  /**
   * Module dependencieas.
   */

  var config = require('./config'),
      express = require('express'),
      routes = require('./routes'),
      RedisStore = require('connect-redis')(express),
      passport = require('passport'),
      app = express();


    app.set('view engine', 'ejs');
    app.set('view options', {
        layout: false
    })

  /**
   * Setting up middleware stack before expressing any routes,
   * as express automatically adds app.router to the stack the first time
   * it hits a route, if it is not already part of the stack
   */
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    store: new RedisStore({
        host: 'localhost',
        port: 6379
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: '/'
    },
    secret: config.session.secret
  }))
  app.use(express.static(__dirname + '/public'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.errorHandler());

  var login = require('./login')(app);
  app.get('/user', routes.index);
  app.get('/hubbub/:repo/:event', routes.setupHubbub);
  app.get('/hubbub/del/:repo/:event', routes.teardownHubbub);
  app.post('/hubbub/push', routes.handlePush);

  var start = function(readyCallback) {
    if (!this.server) {
      this.server = app.listen(app.get('port'), function() {
        if (readyCallback) { readyCallback(); }
      });
    }
  };

  var stop = function() {
    this.server.close();
    this.server = null;
  };

  return {
    start: start,
    stop: stop
  };

}());
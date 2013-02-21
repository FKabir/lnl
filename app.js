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

  var config = require('./config');
  var express = require('express');
  var routes = require('./routes');
  var RedisStore = require('connect-redis')(express);
  var passport = require('passport');
  var app = express();

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
  app.set('json spaces', 0);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.static(__dirname + '/public'));
  app.use(express.session({
    key: 'sid',
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
  app.use(express.errorHandler());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  /**
   * Routes
   */

  var login = require('./login')(app);

  app.get('/', routes.index)
  app.post('/api/deleteConnection', routes.api.github.deleteConnection);
  app.post('/api/connect', routes.api.github.createConnection);
  app.post('/api/attask/session', routes.api.attask.login);
  app.get('/api/attask/projects', routes.api.attask.getProjects);
  app.get('/api/attask/projects/resync', routes.api.attask.refreshProjects);
  app.get('/api/github/projects', routes.api.github.getProjects);
  app.get('/api/github/projects/resync', routes.api.github.refreshProjects);
  app.get('/user', routes.index);
  app.get('/hook/:repo/:event', routes.setupHubbub);
  //app.get('/hook/del/:repo/:event', routes.teardownHubbub);
  app.get('/hook', routes.handleHook);

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
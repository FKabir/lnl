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
  //Our applications configuration will live in this "module". This allows us to
  //hide API keys, store configuration data all in one place, just makes it all
  //around easier.
  var config = require('./config');
  var express = require('express');
  var routes = require('./routes');
  var RedisStore = require('connect-redis')(express);
  var passport = require('passport');
  var app = express();

  app.set('view engine', 'ejs');
  app.set('view options', {
    layout: false
  });
  app.set('port', process.env.PORT || 3000);
  //This will set the number of spaces express will put for indentation levels
  //when outputting JSON. I find it easier to use a chrome/firefox extension to
  //parse your JSON so I set this to zero to make our data small.
  //Express will automatically do this if you launch it in production mode.
  app.set('json spaces', 0);

  //If you declare a route, express automatically adds app.router to the
  //middleware stack as the first item. This is not what you want the
  //vast majority of the time. So we will immediately setup our middleware stack
  app.use(express.favicon());
  //Requests are outputted to stdout as they come in. The equivalent to this
  //would be Apache access logs.
  app.use(express.logger('dev'));
  //This middleware is awesome, it's responsible for never having to deal with
  //raw requests, you get a nice request object, with fields filled out for you.
  app.use(express.bodyParser());
  //This is more useful for development, it lets you pass a post parameter
  //called _method, that will cause the route to be run be that HTTP method.
  //EX: _method=put, app.put route will run. Useful for testing routes.
  app.use(express.methodOverride());
  //This is what parses cookies on the server, just throw it in and forget
  //pretty much.

  //This is where order really starts to matter, your cookie parser must come
  //before your session middleware, as it depends on the ability to read
  //the session cookie.
  app.use(express.cookieParser());
  //This serves at the static fileserver for Express apps, you can specify a
  //directory, and if a path matches, then it will serve that file, otherwise it
  //continues down the middleware stack.
  app.use(express.static(__dirname + '/public'));
  //This is what causes a session to be attached to a request.
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
  }));
  //The standard 404 error page in Express, if nothing handles the error,
  //express will just dump a nice error page, similar to XDebug (stack trace)
  app.use(express.errorHandler());

  //Passport internals, this is a module to handle many different login
  //"Strategies", it makes it very simple to handle OAuth1/2 flow, Facebook, etc
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  //Here is an example of defining routes related to the login flow inside
  //a module.
  require('./login')(app);

  //The default route, which serves the index.ejs view for the root route.
  app.get('/', routes.index);

  //Below are the routes that I've classified as my API, they are what serves
  //the proper data formatted as JSON to backbone when it askes for it.
  app.post('/api/deleteConnection', routes.api.github.deleteConnection);
  app.post('/api/connect', routes.api.github.createConnection);
  app.post('/api/attask/session', routes.api.attask.login);
  app.get('/api/attask/projects', routes.api.attask.getProjects);
  app.get('/api/attask/projects/resync', routes.api.attask.refreshProjects);
  app.get('/api/github/projects', routes.api.github.getProjects);
  app.get('/api/github/projects/resync', routes.api.github.refreshProjects);

  //These two routes are essentially direct tie-ins to the GitHub API, they will
  //create the WebHook that this app responses to.
  //This is also the first use of a route named parameter, which can be used to
  //direct responses in the function which handles the request.
  //Ex: req.params.repo and req.params.event
  app.get('/hook/:repo/:event', routes.setupHubbub);
  //app.get('/hook/del/:repo/:event', routes.teardownHubbub);

  //This is where all the magic comes together in a way to long function, that
  //reads the data from GitHub, and determines if/where to post hours to AtTask
  app.post('/hook', routes.handleHook);

  //This is just a small pattern I find useful, if for whatever reason you need
  //to restart the webserver, by exporting these functions, it becomes extremely
  //simple to get a fresh server, (mostly useful for tests.)
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
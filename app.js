/**
 * Wrapping the app.js file to prevent leakage to the process.
 * Therefore, the only thing that is exported when you require('./app')
 * will be what is returned
 */
module.exports = (function() {
  'use strict';

  /**
   * Module dependencies.
   */

  var express = require('express'),
      routes = require('./routes'),
      app = express();

  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(express.errorHandler());
  app.get('/help', routes.index);

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
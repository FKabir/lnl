module.exports = function(app) {
  'use strict';

  //Module dependencies
  var config = require('./config');
  var passport = require('passport');
  var redis = require('redis');
  var client = redis.createClient();
  var GithubStrategy = require('passport-github').Strategy;

  // Passport session setup.
  //Store just the user id in the session object, if more information is needed
  //use that ID to get the user data
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    client.hgetall('users:' + id, function(err, reply) {
      done(null, reply);
    });
  });

  //Use the GitHubStrategy within Passport.
  //  Strategies in Passport require a `verify` function, which accept
  //  credentials (in this case, an accessToken, refreshToken, and GitHub
  //  profile), and invoke a callback with a user object.
  passport.use(new GithubStrategy({
    clientID: config.github.clientId,
    clientSecret: config.github.clientSecret,
    callbackURL: 'http://darwinapp.me/auth/github/callback',
    scope: [
    'repo'
    ],
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    req.session.accessToken = accessToken;
    if (!req.user) {
      //Not logged in, Authenticate using Github
      profile.emails = JSON.stringify(profile.emails);

      client.hmset('users:' + profile.id, profile, function(err) {
        if (err) {
          done(err);
        } else {
          client.sadd('users', profile.id);
          return done(null, profile);
        }
      });
    } else {
      //logged in, Associate Github account with user, perserve
      //login state by supplying existing user with the association
      return done(null, req.user);
    }
  }));

  app.get('/auth/github',
    passport.authenticate('github'),
    function() {
      //The request will be redirected to Github for authentication, so this
      //function will not be called. ok?
    }
  );

  app.get('/auth/github/callback',
    passport.authenticate('github', {
      failureRedirect: '/login?failed=1'
    }),
    function(req, res) {
      res.redirect('/') ;
    }
  );

  app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
  });

};
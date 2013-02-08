module.exports = function(app) {
    'use strict';

    /**
     * Module dependencies
     */
    var config = require('./config'),
        passport = require('passport'),
        GithubStrategy = require('passport-github').Strategy,
        GithubClient = require('github-client');



    // Passport session setup.
    //Throw in the entire user object into session, cause we are using redis to store
    //our data, so it makes no sense to just store the id, then use that id to go
    //the user data.. from inside redis. Just gonna put it all together.
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    // Use the GitHubStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and GitHub
    //   profile), and invoke a callback with a user object.
    passport.use(new GithubStrategy({
        clientID: config.github.clientId,
        clientSecret: config.github.clientSecret,
        callbackURL: 'http://localhost:3000/auth/github/callback',
        scope: [
            'repo'
        ],
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
        req.session.accessToken = accessToken;
        if (!req.user) {
            //Not logged in, Auth using Github
            return done(null, profile);
        } else {
            //logged in Associate Github account with user, perserve
            //login state by supplying existing user with the association
            return done(null, req.user);
        }
    }));

    app.get('/auth/github', passport.authenticate('github'), function(req, res) {
        //The request will be redirected to Github for authentication, so this function
        //will not be called.
    });

    app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/login?failed=1'}),
    function(req, res) {
       res.redirect('/') ;
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
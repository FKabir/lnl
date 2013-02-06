module.exports = function(app) {
    'use strict';

    /**
     * Module dependencies
     */
    var config = require('./config'),
        passport = require('passport'),
        GithubStrategy = require('passport-github').Strategy;

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete GitHub profile is serialized
    //   and deserialized.
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
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
        if (!req.user) {
            //Not logged in, Auth using Github
            console.log(profile);
            return done(null, profile);
        } else {
            //logged in Associate Github account with user, perserve
            //login state by supplying existing user with the association
            console.log(req.user);
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
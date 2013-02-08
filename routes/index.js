'use strict';

var _ = require('lodash'),
    config = require('../config'),
    redis = require('redis'),
    client = redis.createClient(),
    gh = require('github-client');

client.on('error', function(err) {
    console.log("Redis Error: " + err);
})


/*
 * GET home page.
 */
exports.index = function(req, res){
  console.log(req.session);

  var ghc = gh({
    accessToken: req.session.accessToken
  })

  ghc.getRepos(function(error, response) {
    //console.log(response);
    if (error) throw Error(error);
    client.set('repos:' + req.user.username,
        JSON.stringify(response),
        function(err, resp) {
            if (err) {
                res.send('Error: ' + err, 400);
                throw Error(err);
            } else {
                res.send('Ok', 200);
            }

        }
    );
  });
};

exports.setupHubbub = function(req, res) {
    var ghc = gh({
        accessToken: req.session.accessToken
    });

    console.log(req.user);

    var params = {
        owner: req.user.username,
        repo: req.params.repo,
        event: req.params.event,
        callbackURI: config.github.hubbub + req.params.event
    };

    ghc.getDatHubbubOn(params, function(err, response) {
         res.send(response);
    })
}

exports.teardownHubbub = function(req, res) {
    var ghc = gh({
        accessToken: req.session.accessToken
    });

    var params = {
        owner: req.user.username,
        repo: req.params.repo,
        event: req.params.event,
        callbackURI: config.github.hubbub + req.params.event
    };

    ghc.getDatHubbubOff(params, function(err, response) {
        res.send(response);
    })
}

exports.handlePush = function(req, res) {
    console.log(req.body);
}
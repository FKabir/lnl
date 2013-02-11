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

    var params = {
        owner: req.user.username,
        repo: req.params.repo,
        events: req.params.events,
        callbackURI: config.github.hookHandler
    };

    ghc.getDatHubbubOn(params, function(err, response) {
        res.send(response);
    })
}

exports.teardownHubbub = function(req, res) {
    /*var ghc = gh({
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
    })*/
}

exports.handleHook = function(req, res) {
    var fs = require('fs');
    var githubResponse = fs.readFileSync('test.json', 'utf8');
    var header = {"X-Github-Event": "push"};

    switch (header["X-Github-Event"]) {
        case "push":
            var hours = 0;

            githubResponse = JSON.parse(githubResponse);

            _(githubResponse.commits).each( function( value, key, githubResponse ) {

            })

            if (githubResponse.ref.indexOf('refs/heads') != -1) {
                console.log(githubResponse.ref.slice(11));

                res.send(githubResponse.ref);
            }

            break;
        default:
            res.send('Default')
            break;
    }
}

function parseBranch(refs) {

}
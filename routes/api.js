'use strict';

var _ = require('lodash'),
    config = require('../config'),
    redis = require('redis'),
    client = redis.createClient(),
    gh = require('github-client');

client.on('error', function(err) {
    console.log("Redis Error: " + err);
})

function refreshRepos(req, res) {
    var ghc = new gh({
        accessToken: req.session.accessToken
    })

    ghc.getRepos(function(error, repos) {
        if (error) throw Error(error);

        _(repos).each(function( repo, key, repos ) {
            repo.owner = JSON.stringify(repo.owner);
            repo.permissions = JSON.stringify(repo.permissions);
            client.hmset('users:' + req.user.id + ':repos:' + repo.id,
                repo,
                function(err, resp) {
                    if (err) {
                        res.send('Error: ' + err, 400);
                    } else {
                        client.sadd('users:' + req.user.id + ':repos', repo.id);
                        res.send('Ok', 200);
                    }
                }
            );
        });
    });
}


exports.getProject = function(req, res) {
    client.hgetall
}

exports.getProjects = function(req, res) {
    refreshRepos(req, res);

    client.smembers('users:' + req.user.id + ':repos', function(err, reply) {
        _(reply).each( function( value, key, reply ) {

        })
    });

    client.hgetall('users:' + req.user.id + ':repos:', function(err, reply) {
        console.log(reply);
        res.setHeader('Content-Type', 'application/json');
        res.send(reply);
    });
}
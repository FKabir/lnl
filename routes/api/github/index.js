'use strict';

var _ = require('lodash'),
    config = require('../../../config'),
    redis = require('redis'),
    client = redis.createClient(),
    async = require('async'),
    gh = require('github-client');

//Helper Functions
function getUserRepoIds(id, done) {
    client.smembers('users:' + id + ':repos', function(err, repoIds) {
        if (err) {
            done(err);
        } else {
            done(null, repoIds);
        }
    })
}

function refreshRepos(req, res, done) {
    var ghc = new gh({
        accessToken: req.session.accessToken
    })

    async.waterfall([
        function(callback) {
            getUserRepoIds(req.user.id, function(err, repoIds) {
                client.del('users:' + req.user.id + ':repos');
                async.each(repoIds,
                    function(repoId, done) {
                        client.del('users:' + req.user.id + ':repos:' + repoId, function(err) {
                            if (err) {
                                done(err);
                            } else {
                                done(null);
                            }
                        });
                    },
                    function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    }
                )
            });
        },
        function(callback) {
            ghc.getRepos(function(err, repos) {
                if (err) {
                    callback(err);
                } else {
                    async.each(repos,
                        function(repo, done) {
                            repo.owner = JSON.stringify(repo.owner);
                            repo.permissions = JSON.stringify(repo.permissions);
                            client.hmset('users:' + req.user.id + ':repos:' + repo.id,
                                repo,
                                function(err, resp) {
                                    repo.owner = JSON.parse(repo.owner);
                                    repo.permissions = JSON.parse(repo.permissions);
                                    if (err) {
                                        done(err);
                                    } else {
                                        client.sadd('users:' + req.user.id + ':repos', repo.id);
                                        done(null)
                                    }
                                }
                            );
                        },
                        function(err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, repos);
                            }
                        }
                    )
                }
            });
        }
    ], function(err, result) {
        if (err) {
            done(err);
        } else {
            done(null, result);
        }
    })
}

function isAuthenticated(req) {
    if (req.user.id) {
        return true;
    } else {
        return false;
    }
}

module.exports = (function() {

    function refreshProjects(req, res) {
        if (req.isAuthenticated()) {
            refreshRepos(req, res, function(err, repos) {
                if (err) {
                    res.send(err, 400);
                } else {
                    res.send(repos, 200);
                }
            });
        } else {
            res.send(404);
        }
    }

    function getProjects(req, res) {
        if (req.isAuthenticated()) {
            getUserRepoIds(req.user.id, function(err, repoIds) {
                var repos = [];

                async.each(repoIds,
                    function(repoId, done) {
                        client.hgetall('users:' + req.user.id + ':repos:' + repoId, function(err, reply) {
                            if (err) {
                                done(err);
                            } else {
                                reply.owner = JSON.parse(reply.owner);
                                reply.permissions = JSON.parse(reply.permissions);
                                repos.push(reply);
                                done(null);
                            }
                        })
                    },
                    function(err) {
                        if (err) {
                            res.send(err, 400);
                        } else {
                            res.send(repos, 200);
                        }
                    }
                );
            });
        } else {
            res.send(404);
        }
    }

    return {
        refreshProjects: refreshProjects,
        getProjects: getProjects
    }

}());
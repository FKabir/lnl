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

function createRepoConnection(userId, repoId, attaskId, done) {
  client.set('users:' + userId + ':connection:' + repoId,
    attaskId,
    function(err, result) {
      if (err) {
        done(err);
      } else {
        done(null, result);
      }
    }
  );
}

function getRepoConnection(userId, repoId, done) {
  client.get('users:' + userId + ':connection:' + repoId, function(err, attaskId) {
    if (err) {
      done(err);
    } else {
      done(null, attaskId);
    }
  });
}

function removeRepoConnection(userId, repoId, done) {
  client.del('users:' + userId + ':connection:' + repoId, function(err, result) {
    if (err) {
      done(err);
    } else {
      done(null, result);
    }
  });
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
              getRepoConnection(req.user.id, repo.id, function(err, attaskId) {
                async.series([
                  function(callback) {
                    client.hmset('users:' + req.user.id + ':repos:' + repo.id,
                      repo,
                      function(err, resp) {
                        repo.owner = JSON.parse(repo.owner);
                        repo.permissions = JSON.parse(repo.permissions);
                        client.sadd('users:' + req.user.id + ':repos', repo.id);
                        callback(null);
                      }
                    );
                  },
                  function(callback) {
                    if (attaskId) {
                      client.hgetall('users:' + req.user.id + ':projects:' + attaskId, function(err, project) {
                        project.tasks = JSON.parse(project.tasks);
                        repo.connectedTo = project;
                        callback(null);
                      })
                    } else {
                      callback(null);
                    }
                  }
                ], function() {
                  done()
                });
              });
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

  function connectRepo(req, res) {
    if (req.isAuthenticated()) {
      createRepoConnection(req.user.id, req.body.repoId, req.body.attaskId, function(err, result) {
        if (err) {
          res.send(400);
        } else {
          res.send(200);
        }
      })
    }
  }

  function removeConnection(req, res) {
    if (req.isAuthenticated()) {
      removeRepoConnection(req.user.id, req.body.repoId, function(err, result) {
        if (err) {
          res.send(400);
        } else {
          res.send(200);
        }
      })
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
                getRepoConnection(req.user.id, repoId, function(err, attaskId) {
                  if (attaskId) {
                    client.hgetall('users:' + req.user.id + ':projects:' + attaskId, function(err, project) {
                      project.tasks = JSON.parse(project.tasks);
                      reply.connectedTo = project;
                      repos.push(reply);
                      done(null);
                    })
                  } else {
                    repos.push(reply);
                    done(null);
                  }
                });
              }
            })
          },
          function(err) {
            if (err) {
              res.send(err, 400);
            } else {
              if (repos.length) {
                res.send(repos, 200);
              } else {
                refreshRepos(req, res, function(err, repos) {
                  if (err) {
                    res.send(err, 400);
                  } else {
                    res.send(repos, 200);
                  }
                });
              }

            }
          }
          );
      });
    } else {
      res.send(404);
    }
  }

  return {
    createConnection: connectRepo,
    deleteConnection: removeConnection,
    refreshProjects: refreshProjects,
    getProjects: getProjects
  }
}());
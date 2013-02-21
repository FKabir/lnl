'use strict';

var _ = require('lodash'),
api = require('./api'),
async = require('async'),
config = require('../config'),
redis = require('redis'),
client = redis.createClient(),
fuzzy = require('fuzzy'),
gh = require('github-client'),
at = require('attask-client');

client.on('error', function(err) {
  console.log("Redis Error: " + err);
})

exports.api = api;

exports.index = function(req, res){
  res.render('index');
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
  var ghc = new gh();


  switch (req.headers["X-Github-Event"]) {
    case "push":
      githubResponse = JSON.parse(req.body);

      var pushDetails = {};
      pushDetails.name = githubResponse.repository.name;
      pushDetails.repoId = githubResponse.repository.id;
      pushDetails.users = {};
        /*{
          name:
          repoId:
          users: {"userid": {
            name:
            attaskProjectId:
            hours: {
              attaskTaskId:
              hours:
            }
          }}
        }*/
      async.each(githubResponse.commits, function(commit, callback) {
        ghc.getUser(commit.author.username, function(err, response, body) {
          var body = JSON.parse(body);
          if (body.message != undefined) {
            if (body.message.indexOf('exceeded')) {
              throw Error('API Limit Reached')
            }
          } else {
            var userId = body.id;
            client.sismember('users', userId, function(err, result) {
              if (result) {
                getAttaskProjectId(userId, pushDetails.repoId, function(err, attaskProjectId) {
                  if (err || attaskProjectId == "") {
                    callback(err);
                  } else {
                    if (commit.message) {
                      var regexp = new RegExp('^(.+):([0-9]+\.[0-9]+)', 'gm');
                      var matches = regexp.exec(commit.message);
                      var taskName = matches[1];
                      var taskHours = parseFloat(matches[2], 10);

                      if (pushDetails.users[userId] == undefined) {
                        var obj = {
                          name: commit.author.username,
                          projectId: attaskProjectId,
                          hours: {

                          }
                        }
                        obj.hours[taskName] = taskHours;
                        pushDetails.users[userId] = obj;
                      } else {
                        if (pushDetails.users[userId].hours[taskName] == undefined) {
                          pushDetails.users[userId].hours[taskName] = taskHours;
                        } else {
                          pushDetails.users[userId].hours[taskName] += taskHours;
                        }
                      }
                      callback(null);
                    } else {
                      callback('no commit message');
                    }
                  }
                })
              } else {
                callback('No data for user');
              }
            });
          }
        });
      }, function(err, result) {
        //console.log(pushDetails);
        _(pushDetails.users).each( function( user, userId, users ) {
          getTasks(userId, user.projectId, function(err, tasks) {
            if (err) {
              //console.log(err);
            }
            //console.log(tasks);
            _(user.hours).each(function( hour, taskName, hours ) {
              //console.log(taskName);
              var results = fuzzy.filter(taskName, tasks, {
                extract: function(item) {
                  return item.name;
                }
              });
              var matches = results.map(function(el) { return el.original; });

              if (matches.length) {
                var taskId = matches[0].ID;
                console.log(taskId);
                console.log(hour);
                console.log(user.projectId);
                console.log(userId);
                sendHour({
                  userId: userId,
                  hours: hour,
                  taskID: taskId,
                  projectID: user.projectId
                }, function(err, body) {
                  if (!err) {
                    res.send(body);
                  } else {
                    res.send(err, 400);
                  }
                })
              } else {
                client.set('users:' + userId + ':notmatched')
              }
            })
          })
        })
      });
      break;
    default:
      res.send('Default')
      break;
  }
}

function getAttaskProjectId(userId, repoId, done) {
  client.get('users:' + userId + ':connection:' + repoId, function(err, result) {
    if (result) {
      done(null, result);
    } else {
      done(err);
    }
  });
}

function getTasks(userId, projectId, done) {
  client.hget('users:' + userId + ':projects:' + projectId, 'tasks', function(err, tasks) {
    if (err) {
      done(err);
    } else {
      done(null, JSON.parse(tasks));
    }
  });
}

function sendHour(params, done) {
  client.get('users:' + params.userId + ':attasksession', function(err, sessionID) {
    var atc = new at({
      sessionID: sessionID
    });

    atc.submitHour(params, function(err, body) {
      if (err) {
        async.parallel([
          function(callback) {
            client.get('users:' + params.userId + ':attaskusername', callback);
          },
          function(callback) {
            client.get('users:' + params.userId + ':attaskpassword', callback);
          }
        ], function(err, results) {
          if (err) {
            done(err);
          } else {
            //regenerate attask session
            atc.login(function(err, resp) {
              if (err) {
                done(err);
              } else {
                client.set('users:' + req.user.id + ':attasksession', resp.data.sessionID, function(err, result) {
                  if (err) {
                    done(err);
                  } else {
                    sendHour(params, done);
                  }
                });
              }
            });
          }
        })
      } else {
        done(null, body);
      }
    });
  })
}
module.exports = (function() {
  'use strict';

  //Module dependencies
  var _ = require('lodash');
  var redis = require('redis');
  var client = redis.createClient();
  var async = require('async');
  var At = require('attask-client');

  var sessID;

  function getSession(req) {
    if (req.session.attasksession) {
      return req.session.attasksession;
    }
    return false;
  }

  function getUserProjectIds(id, done) {
    client.smembers('users:' + id + ':projects', function(err, projectIds) {
      if (err) {
        done(err);
      } else {
        done(null, projectIds);
      }
    });
  }

  function getProjects(req, res) {
    sessID = getSession(req);
    if (sessID && req.user) {
      var projects = [];
      getUserProjectIds(req.user.id, function(err, projectIds) {
        async.each(projectIds,
          function(projectId, done) {
            client.hgetall('users:' + req.user.id + ':projects:' + projectId,
              function(err, project) {
                if (err) {
                  done(err);
                } else {
                  project.tasks = JSON.parse(project.tasks);
                  projects.push(project);
                  done(null);
                }
              }
            );
          },
          function(err) {
            if (err) {
              res.send(401);
            } else {
              if (projects.length) {
                res.send(projects, 200);
              } else {
                refreshProjects(req, res);
              }

            }
          }
        );
      });
    } else {
      res.send(401);
    }
  }

  function refreshProjects(req, res) {
    sessID = getSession(req);
    if (sessID && req.user) {
      var atc = new At({
        "sessionID": sessID
      });
      async.auto({
        clearProjects: function(callback) {
          getUserProjectIds(req.user.id, function(err, repoIds) {
            client.del('users:' + req.user.id + ':projects');
            async.each(repoIds,
              function(repoId, done) {
                client.del('users:' + req.user.id + ':projects:' + repoId,
                  function(err) {
                    if (err) {
                      done(err);
                    } else {
                      done(null);
                    }
                  }
                );
              },
              function(err) {
                if (err) {
                  callback(err);
                } else {
                  callback(null);
                }
              }
            );
          });
        },
        getProjects: function(callback) {
          atc.getProjects(function(err, projects) {
            if (err) {
              callback(err);
            } else {
              projects.data.sumHours = 0;
              _.each(projects.data, function(project) {
                project.sumHours = 0;
                _.each(project.tasks, function(task) {
                  task.sumHours = 0;
                  _.each(task.hours, function(hour) {
                    task.sumHours += hour.hours;
                  });
                  project.sumHours += task.sumHours;
                });
                projects.data.sumHours += project.sumHours;
              });
              callback(null, projects.data);
            }
          });
        },
        saveProjects: ['clearProjects', 'getProjects',
          function(callback, results) {
            var projects = results.getProjects;
            async.each(projects,
              function(project, done) {
                project.tasks = JSON.stringify(project.tasks);
                client.hmset('users:' + req.user.id + ':projects:' + project.ID,
                  project,
                  function(err, resp) {
                    project.tasks = JSON.parse(project.tasks);
                    console.log(resp);
                    console.log(err);
                    if (err) {
                      done(err);
                    } else {
                      client.sadd('users:' + req.user.id + ':projects',
                        project.ID
                      );
                      done(null);
                    }
                  }
                );
              },
              function(err) {
                if (err) {
                  callback(err);
                } else {
                  callback(null, projects);
                }
              }
            );
          }
        ],
      }, function(err, results) {
        if (err) {
          res.send(err, 401);
        } else {
          res.send(results.getProjects, 200);
        }
      });
    }
  }

  function storeSession(req, res) {
    var atc = new At({
      "username": req.body.username,
      "password": req.body.password
    });

    atc.login(function(err, resp) {
      if (!req.user) {
        res.send(401);
      } else if (err) {
        res.send(err, 400);
      } else {
        req.session.attasksession = resp.data.sessionID;
        req.session.attaskuserid = resp.data.userID;
        client.set('users:' + req.user.id + ':attasksession',
          resp.data.sessionID
        );
        client.set('users:' + req.user.id + ':attaskuserid',
          resp.data.userID
        );
        client.set('users:' + req.user.id + ':attaskusername',
          req.body.username
        );
        client.set('users:' + req.user.id + ':attaskpassword',
          req.body.password
        );
        refreshProjects(req, res);
      }
    });
  }

  return {
    login: storeSession,
    getProjects: getProjects,
    refreshProjects: refreshProjects
  };
}());
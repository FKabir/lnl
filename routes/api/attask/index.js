var _ = require('lodash');
var config = require('../../../config');
var redis = require('redis');
var client = redis.createClient();
var async = require('async');
var at = require('attask-client');

module.exports = (function() {

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
    if (sessID = getSession(req) && req.user) {
      var projects = [];
      getUserProjectIds(req.user.id, function(err, projectIds) {
        async.each(projectIds,
          function(projectId, done) {
            client.hgetall('users:' + req.user.id + ':projects:' + projectId, function(err, project) {
              if (err) {
                done(err);
              } else {
                project.tasks = JSON.parse(project.tasks);
                projects.push(project);
                done(null);
              }
            });
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
        )
      });
    } else {
      res.send(401);
    }
  }

  function refreshProjects(req, res) {
    if (sessID = getSession(req)) {
      var atc = new at({
        "sessionID": sessID
      })

      async.auto({
        clear_projects: function(callback) {
          getUserProjectIds(req.user.id, function(err, repoIds) {
            client.del('users:' + req.user.id + ':projects');
            async.each(repoIds,
              function(repoId, done) {
                client.del('users:' + req.user.id + ':projects:' + repoId, function(err) {
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
            );
          });
        },
        get_projects: function(callback) {
          atc.getProjects(function(err, projects) {
            if (err) {
              callback(err);
            } else {
              projects.data.sum_hours = 0;
              _.each(projects.data, function(project) {
                project.sum_hours = 0;
                _.each(project.tasks, function(task) {
                  task.sum_hours = 0;
                  _.each(task.hours, function(hour) {
                    task.sum_hours += hour.hours;
                  });
                  project.sum_hours += task.sum_hours;
                });
                projects.data.sum_hours += project.sum_hours;
              });
              callback(null, projects.data);
            }
          })
        },
        save_projects: ['clear_projects', 'get_projects', function(callback, results) {
          var projects = results.get_projects;
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
                    client.sadd('users:' + req.user.id + ':projects', project.ID);
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
        }],
      }, function(err, results) {
        if (err) {
          res.send(err, 401);
        } else {
          res.send(results.get_projects, 200);
        }
      });
    }
  }

  function storeSession(req, res) {
    console.log(req.params);
    console.log(req.query);

    var atc = new at({
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
        client.set('users:' + req.user.id + ':attasksession', resp.data.sessionID);
        client.set('users:' + req.user.id + ':attaskuserid', resp.data.userID);
        client.set('users:' + req.user.id + ':attaskusername', req.body.username);
        client.set('users:' + req.user.id + ':attaskpassword', req.body.password);
        refreshProjects(req, res)
      }
    });
  }

  return {
    login: storeSession,
    getProjects: getProjects,
    refreshProjects: refreshProjects
  }
}());
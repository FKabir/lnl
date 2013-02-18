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

  function getProjects(req, res) {
    if (sessID = getSession(req)) {
      client.get('attask:' + req.session.attaskuserid + ':data', function(err, resp) {
        if (err) {
          res.send(401);
        } else {
          if (resp != null) {
            res.send(JSON.parse(resp).data, 200);  
          } else {
            refreshProjects(req, res);
          }
        }
      })
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
          client.del('attask:' + req.session.attaskuserid + ':data',
            function(err, resp) {
              if (err) {
                callback(err);
              } else {
                callback(null);
              }
            }
          );
        },
        get_projects: function(callback) {
          atc.getProjects(function(err, resp) {
            if (err) {
              callback(err);
            } else {
              resp.data.sum_hours = 0;
              _.each(resp.data, function(project) {
                project.sum_hours = 0;
                _.each(project.tasks, function(task) {
                  task.sum_hours = 0;
                  _.each(task.hours, function(hour) {
                    task.sum_hours += hour.hours;
                  });
                  project.sum_hours += task.sum_hours;
                });
                resp.data.sum_hours += project.sum_hours;
              });
              callback(null, resp);
            }
          })
        },
        save_projects: ['clear_projects', 'get_projects', function(callback, results) {
          client.set('attask:' + req.session.attaskuserid + ':data',
            JSON.stringify(results.get_projects),
            function(err, resp) {
              if (err) {
                callback(err);
              } else {
                callback(null)
              }
            }
          )
        }],
      }, function(err, results) {
        if (err) {
          res.send(err, 401);
        } else {
          res.send(results.get_projects.data, 200);
        }
      });
    }
  }

  function storeSession(req, res) {
    console.log(req.params);
    console.log(req.query);

    var client = new at({
      "username": req.body.username,
      "password": req.body.password
    });

    client.login(function(err, resp) {
      if (err) {
        res.send(err, 400);
      } else {
        req.session.attasksession = resp.data.sessionID;
        req.session.attaskuserid = resp.data.userID;
        refreshProjects(req, res)
      }
    })
  }

  return {
    login: storeSession,
    getProjects: getProjects,
    refreshProjects: refreshProjects
  }
}());
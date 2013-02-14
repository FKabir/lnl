var _ = require('lodash'),
    config = require('../../../config'),
    redis = require('redis'),
    client = redis.createClient(),
    async = require('async'),
    at = require('attask-client');

function refreshProjects(req, res, done) {
    var atc = new at();


}

module.exports = (function() {

    function getProjects() {
        return;
    }

    function refreshProjects() {
        return;
    }

    return {
        getProjects: getProjects,
        refreshProjects: refreshProjects
    }
}());
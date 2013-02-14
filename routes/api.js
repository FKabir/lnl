'use strict';
module.exports = function() {
    var githubAPI = require('./api/github'),
        attaskAPI = require('./api/attask');

    return {
        github: githubAPI,
        attask: attaskAPI
    }
}();
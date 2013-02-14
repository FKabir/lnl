define([
    // Application
    'app',

    // Views
    'modules/github/views'
],

function(app, Views) {
    //Create a new module.
    var GithubList = app.module();

    //Default Model.
    GithubList.Model = Backbone.Model.extend({

    });

    //Default Collection.
    GithubList.Collection = Backbone.Collection.extend({
        model: GithubList.Model,
        url: '/api/github/projects'
    });

    GithubList.Views = Views;

    //Return the module for AMD compliance.
    return GithubList;
});
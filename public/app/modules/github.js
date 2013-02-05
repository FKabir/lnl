define([
    // Application
    'app',

    // Views
    'modules/github/views'
],

function(app, Views) {
    //Create a new module.
    var Github = app.module();

    //Default Model.
    Github.Model = Backbone.Model.extend({

    });

    //Default Collection.
    Github.Collection = Backbone.Collection.extend({
        model: Github.Model
    });

    Github.Views = Views;

    //Return the module for AMD compliance.
    return Github;
});
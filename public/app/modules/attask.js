define([
    // Application
    'app',

    // Views
    'modules/attask/views'
],

function(app, Views) {
    //Create a new module.
    var AttaskList = app.module();

    //Default Model.
    AttaskList.Model = Backbone.Model.extend({

    });

    //Default Collection.
    AttaskList.Collection = Backbone.Collection.extend({
        model: AttaskList.Model,
        url: '/api/attask/projects'
    });

    AttaskList.Views = Views;

    //Return the module for AMD compliance.
    return AttaskList;
});
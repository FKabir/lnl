define([
    // Application
    'app',

    // Views
    'modules/foo/views'
],

function(app, Views) {
    //Create a new module.
    var Foo = app.module();

    //Default Model.
    Foo.Model = Backbone.Model.extend({

    });

    //Default Collection.
    Foo.Collection = Backbone.Collection.extend({
        model: Foo.Model
    });

    Foo.Views = Views;

    //Return the module for AMD compliance.
    return Foo;
});
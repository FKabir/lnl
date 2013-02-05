define([
    //Application
    'app',

    //Modules
    'modules/github'
],

function(app, Foo) {
    // Defining the application router, you can attach sub roubers here
    var Router = Backbone.Router.extend({
        routes: {
            '': 'index',
            'show': 'index2'
        },

        index: function() {
            var collection = new Foo.Collection();
            //collection.fetch();
            //Use and configure a 'main' layout
            app.useLayout('main');


        },

        index2: function() {
            console.log('router hit');
            app.useLayout('main2');
        }
    })



    return Router;
})
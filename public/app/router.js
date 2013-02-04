define([
    //Application
    'app',

    //Modules
    'modules/foo'
],

function(app, Foo) {
    // Defining the application router, you can attach sub roubers here
    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },

        index: function() {
            var collection = new Foo.Collection();
            //collection.fetch();
            //Use and configure a 'main' layout
            app.useLayout('main').setViews({
                //Attach the bar View into the content view..
                '.bar': new Foo.Views.Bar({
                    collection: collection
                }),
                '.secondView': new Foo.Views.SecondView({

                })
            }).render();

        }
    })



    return Router;
})
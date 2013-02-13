define([
    //Application
    'app',

    //Modules
    'modules/github',
    'modules/attask'
],

function(app, Github, Attask) {
    var GithubRepos = new Github.Collection();

    // Defining the application router, you can attach sub roubers here
    var Router = Backbone.Router.extend({
        routes: {
            '': 'index',
            'show': 'index2'
        },

        index: function() {
            //Use and configure a 'main' layout
            app.useLayout('main').setViews({
                "github": new Github.Views.RepoList({
                    collection: GithubRepos
                }),
                "attask": new Attask.Views.ProjectList({
                    collection: GithubRepos
                })
            });
        },

        index2: function() {
            console.log('router hit');
            app.useLayout('main2');
        }
    })

    GithubRepos.fetch();

    return Router;
})
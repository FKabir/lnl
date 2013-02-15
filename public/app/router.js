define([
    //Application
    'app',

    //Modules
    'modules/github',
    'modules/attask'
],

function(app, Github, Attask) {
    var GithubRepos = new Github.Collection();
    var AttaskProjects = new Attask.Collection();

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
                    collection: AttaskProjects
                })
            });
        },

        index2: function() {
            app.useLayout('main2');
        }
    })

    GithubRepos.fetch({
        error: function(collection, jqXHR) {
            if (jqXHR.status == 404) {
                GithubRepos.trigger('fail:login_required', jqXHR.status);
            }
        }
    });
    AttaskProjects.fetch({
        error: function(collection, jqXHR) {
            if (jqXHR.status == 401) {
                AttaskProjects.trigger('fail:login_required', jqXHR.status);
            }
        }
    });

    return Router;
})
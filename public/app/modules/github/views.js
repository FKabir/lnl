define([
    'app',

    //Libs
    'backbone'
],

function(app, Backbone) {

    var Views = {};

    Views.Bar = Backbone.View.extend({
        template: JST["foo/bar"],
        tagName: "div",
        className: "bookContainer"
    })

    Views.RepoList = Backbone.View.extend({
        template: JST["repos"],
        className: "repos",

        initialize: function(options) {
            this.collection = options.collection;

            this.collection.on('reset', this.render, this);
        },

        events : {
            "click .icon-refresh": "resyncGithub"
        },

        resyncGithub: function() {
            this.collection.fetch({url: '/api/github/projects/resync'});
        },

        render: function() {
            this.$el.html(this.template({repos: this.collection.toJSON()}));
            return this;
        }
    })

    return Views;
});
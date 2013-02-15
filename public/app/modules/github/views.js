define([
  'app',

  //Libs
  'backbone'
],

function(app, Backbone) {

  var Views = {};

  Views.RepoList = Backbone.View.extend({
    template: JST["repos"],
    className: "repos",

    initialize: function(options) {
      this.collection = options.collection;

      this.collection.on('reset', this.render, this);
      this.collection.on('fail:login_required', function(response) {
        this.$el.html(JST["github-login"]());
      }, this);
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
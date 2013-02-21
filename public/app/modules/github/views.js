define([
  'app',

  //Libs
  'backbone',
  'async'
],

function(app, Backbone, async) {

  var Views = {};

  Views.Repos = Backbone.View.extend({
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
      var self = this;
      //use an array to hold our rendered single views
      //we do this so we only cause a single reflow at the end
      var elements = [];

      if (this.collection.length) {
        this.$el.html(JST["repos"]());
        async.each(this.collection, function(model, callback) {
          var view = new Views.Repo({
            model: model
          });
          //add to array
          elements.push(view.render().el);
          callback(null);
        }, function() {
          self.$('[data-contains="repo"]').html(elements);
        });
      } else {
        this.$el.html(JST["loading"]());
      }
      return this;
    }
  });

  Views.Repo = Backbone.View.extend({
    tagName: 'li',
    className: 'repo well',
    events: {
      "mouseenter": function() {
        this.$el.addClass("hover");
      },
      "mouseleave": function() {
        this.$el.removeClass("hover");
      },
      "click": function() {
        if (app.selectedProject) {
          this.model.set("connectedTo", app.selectedProject.toJSON());
          app.trigger('connectRepo:' + this.model.id, this.model.id, app.selectedProject);
          app.selectedRepo = null;
          app.selectedProject = null;
        } else {
          app.selectedRepo = this.model;
        }
      },
      "click .delete": "onConnectDelete"
    },

    onConnectDelete: function() {
      var self = this;
      var data = {
        repoId: self.model.id
      };
      $.ajax({
        "url": "api/deleteConnection",
        "data": data,
        "method": "POST",
        "success": function() {
          self.model.unset('connectedTo');
          self.render();
        }
      })
    },

    onConnectRepo: function(repoId, projectModel) {
      var self = this;

      var data = {
        repoId: repoId,
        attaskId: projectModel.id
      };
      $.ajax({
        "url": "/api/connect",
        "data": data,
        "method": "POST",
        "success": function() {
          console.log(self.model);
          self.render();
        }
      })
    },

    initialize: function() {
      this.template = JST["repo"];
      app.on('connectRepo:' + this.model.id, this.onConnectRepo, this);
    },
    render: function() {
      //render template
      this.$el.html(this.template({repo: this.model.toJSON()}));
      return this;
    }
  })

  return Views;
});
define([
  'app',

  //Libs
  'backbone',
  'async'
],

function(app, Backbone, async) {

  var Views = {};

  Views.Projects = Backbone.View.extend({
    initialize: function() {
      this.collection.bind("reset", this.render, this);
      this.collection.on('fail:login_required', function(response) {
        this.$el.html(JST["attask-login"]());
      }, this);
    },

    events: {
      "submit #attask-login": "ajaxLogin",
      "click .icon-refresh": "resyncAttask"
    },

    /*Event Handlers*/
    resyncAttask: function() {
      this.collection.fetch({url: '/api/attask/projects/resync'});
    },

    ajaxLogin: function(event) {
      event.preventDefault();
      var data = $(event.currentTarget).serialize();
      var self = this;

      $.ajax({
        "url": "/api/attask/session",
        "data": data,
        "method": "POST",
        "success": function() {
          self.collection.fetch();
          self.render();
        },
        "error": function(req) {
          if (req.status == 400) {
            self.$el.html(JST["attask-login"]({error: "Invalid Credentials"}));
          } else if (req.status == 401) {
            self.$el.html(JST["attask-login"]({error: "Authorize GitHub first."}));
          }
        }
      });
    },

    render: function() {
      var self = this;

      //use an array to hold our rendered single views
      //we do this so we cause a single reflow at the end
      var elements = [];

      if (this.collection.length) {
        this.$el.html(JST["projects"]());
        async.each(this.collection, function(model, callback) {
          var view = new Views.Project({
            model: model
          });
          //add to array
          elements.push(view.render().el);
          callback(null);
        }, function() {
          //push that array into this Views "el"
          self.$('[data-contains="project"]').html(elements);
        });
      } else {
        this.$el.html(JST["loading"]());
      }
      return this;
    }
  });

  Views.Project = Backbone.View.extend({
    tagName: 'li',
    className: 'project well',

    events: {
      "mouseenter": function() {
        this.$el.addClass("hover");
      },

      "mouseleave": function() {
        this.$el.removeClass("hover");
      },

      "click": function() {
        if (app.selectedRepo) {
          app.selectedRepo.set("connectedTo", this.model.toJSON());
          app.trigger('connectRepo:' + app.selectedRepo.get('id'), app.selectedRepo.id, this.model);
          app.selectedRepo = null;
          app.selectedProject = null;

        } else {
          app.selectedProject = this.model;
        }
      }

    },

    initialize: function() {
      this.template = JST['project'];
    },

    render: function() {
      //render template
      this.$el.html(this.template({project: this.model.toJSON()}));
      var view = new Views.TasksTable({
        el: this.$('[data-contains="task"]'),
        model: this.model
      });

      return this;
    }
  });

  Views.TasksTable = Backbone.View.extend({
    template: JST["tasks"],

    events: {
      "click table caption > span": "toggleTable"
    },

    toggleTable: function(evt) {
      if (evt.currentTarget.innerHTML == 'Close') {
        evt.currentTarget.innerHTML = 'Open';
      } else {
        evt.currentTarget.innerHTML = 'Close';
      }
      this.$('tbody td').fadeToggle();
    },

    initialize: function(options) {
      //self rendering
      this.render();
    },

    render: function() {
      this.$el.html(this.template({model: this.model}));
      return this;
    }
  });





  return Views;
});
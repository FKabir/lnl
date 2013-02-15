define([
  'app',

  //Libs
  'backbone'
],

function(app, Backbone) {

  var Views = {};

  Views.ProjectList = Backbone.View.extend({
    template: JST["projects"],
    className: "projects",

    events: {
      "submit #attask-login": "ajaxLogin"
    },

    /*Event Handlers*/
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
        "error": function() {
          self.$el.html(JST["attask-login"]({error: "Invalid Credentials"}));
        }
      });
    },

    /**
     * function.js code
     */

    initialize: function(options) {
      this.collection = options.collection;
      this.collection.on('reset', this.render, this);
      this.collection.on('fail:login_required', function(response) {
        this.$el.html(JST["attask-login"]());
      }, this);
    },

    render: function() {
      if (this.collection.length) {
        this.$el.html(this.template({projects: this.collection.toJSON()}));
      } else {
        this.$el.html(JST["loading"]());
      }

      return this;
    }
  })

  return Views;
});
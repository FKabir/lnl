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

    Views.ProjectList = Backbone.View.extend({
        template: JST["repos"],
        className: "projects",

        initialize: function(options) {
            this.collection = options.collection;

            this.collection.on('reset', this.render, this);
        },

        render: function() {
            if (this.collection.length) {
                this.$el.html(this.template({repos: this.collection.toJSON()}));
            }
        }
    })

    return Views;
});
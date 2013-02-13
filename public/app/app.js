define([
    //Libraries
    'jquery',
    'lodash',
    'backbone',
    'JST',

    //Plugins
],

function($, _, Backbone, JST) {
    'use strict';
    //Our templates, ensure the global JST object is set
    var JST = window.JST = window.JST || JST;
    //Add subview helpers to underscore template
    window.subview = function(subviewName, message) {
        if (!message) {
            return "<div class='loading " + subviewName + "' data-subview='" + subviewName + "'><i class='icon-spin icon-spinner icon-2x'></i></div>";
        } else if (message && message != true) {
            return "<div class='" + subviewName + "' data-subview='" + subviewName + "'>" + message + "</div>";
        } else {
            return "<div data-subview='" + subviewName + "'></div>";
        }
    }
    //Provide a global location to place application configuration settings and module creation.
    var app = {
        //The root path for the app
        root: '/'
    };
    //Mixin Backbone.Events, add a parent view (layout) helper
    return _.extend(app, {
        module: function(additionalProperties) {
            return _.extend({
                Views: {}
            }, additionalProperties);
        },

        setView: function(view, selector) {
            this.layout.renderView(view, '[data-subview=' + selector + ']');
        },

        setViews: function(views) {
            var self = this;
            _.each(views, function(view, selector) {
                self.setView(view, selector);
            });
        },

        //Helper for using layouts (parent views)
        useLayout: function(name) {
            //If already using this Layout, then don't re-inject into the DOM.
            if (this.layout && this.layout.template === JST['layouts/' + name]) {
                return this.layout;
            }


            //If we already have a layout in the DOM, lets run its removal method.
            if (this.layout) {
                this.layout.remove();
            }

            //Define a new Layout.
            var layout = Backbone.View.extend({
                template: JST['layouts/' + name],
                className: 'layout ' + name,
                id: 'layout',
                initialize: function() {
                    this.childViews = {};
                },
                renderView: function(view, selector) {
                    if (!this.childViews[selector]) {
                        this.childViews[selector] = view;
                        view.setElement(selector).render();
                        this.$el.find(selector).removeClass('loading');
                    } else {
                        this.childViews[selector].render();
                    }
                },
                render: function() {
                    this.$el.html(this.template);
                }
            });

            //Create the layout
            layout = new layout();
            //Insert into our DOM element
            $('#main').empty().append(layout.el);
            //Render our layout.
            layout.render();
            //Cache the reference
            this.layout = layout;
            this.layout.views = [];
            //Return the reference, so we can chain this call.
            return this;
        }
    }, Backbone.Events);
})
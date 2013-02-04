define([
    //Libraries
    'jquery',
    'lodash',
    'backbone',
    'JST',

    // Plugins
    'plugins/backbone.layoutmanager'
],

function($, _, Backbone, JST) {
    'use strict';
    //Provide a global location to place application configuration settings and module creation.
    var app = {
        //The root path for the app
        root: '/'
    };
    var JST = window.JST = window.JST || JST;

    //Configure LayoutManager
    Backbone.Layout.configure({
        prefix: 'templates/',
        paths: {
            layout: 'templates/layouts/',
            template: 'templates/'
        },
        manage: true,
        fetch: function(path) {
            path = path + '.html';
            if (!JST[path]) {
                throw Error('AHIEEE NO JST TEMPLATE FOR: ' + path);
            }
            return JST[path];
        }
    })

    //Mixin Backbone.Events, add a layout helper
    return _.extend(app, {
        module: function(additionalProperties) {
            return _.extend({
                Views: {}
            }, additionalProperties);
        },

        //Helper for using layouts (parent views)
        useLayout: function(name) {
            //If already using this Layout, then don't re-inject into the DOM.
            if (this.layout && this.layout.options.template === name) {
                return this.layout;
            }

            //If we already have a layout in the DOM, lets run its removal method.
            if (this.layout) {
                this.layout.remove();
            }

            //Create a new Layout.
            var layout = new Backbone.Layout({
                template: name,
                className: 'layout ' + name,
                id: 'layout'
            });

            //Insert into our DOM element
            $('#main').empty().append(layout.el);

            //Render our layout.
            layout.render();

            //Cache the reference
            this.layout = layout;

            //Return the reference, so we can chain this call.
            return layout;
        }
    }, Backbone.Events);
})
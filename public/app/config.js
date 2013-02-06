//Set the RequireJS configuration for our application
require.config({
    //Initialize the application our main app.js
    deps: ['main'],

    paths: {
        //Easy access to specific folders
        vendor: '../js/vendor',
        plugins: '../js/plugins',

        //Libraries
        jquery: '../js/vendor/jquery',
        lodash: '../js/vendor/lodash',
        backbone: '../js/vendor/backbone',
        bootstrap: '../js/vendor/bootstrap',
        JST: '../js/templates'
    },

    shim: {
        lodash: {
            exports: '_'
        },
        backbone: {
            deps: ['lodash', 'jquery'],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery']
        },

        JST: {
            exports: 'JST'
        }


    }
});
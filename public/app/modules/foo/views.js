define([
    'app',

    //Libs
    'backbone'
],

function(app, Backbone) {

    var Views = {};

    Views.Bar = Backbone.View.extend({
        template: "foo/bar",
        tagName: "div",
        className: "bookContainer"
    })

    Views.SecondView = Backbone.View.extend({
        template: "book",
        className: "book",
        el: false,
        serialize: {
            books: [
                {"title": "Teehee","author":"A Author"},
                {"title": "Oopies","author":"A Author"},
                {"title": "Time to go","author":"A Author"},
                {"title": "Dance with Dragons","author":"A Author"},
                {"title": "Lame","author":"A Author"}
            ]
        }
    })

    return Views;
});
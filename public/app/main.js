require([
    //Application
    'app',
    //Our router
    'router'
], function(app, Router) {
    //define your router on the application namespace and trigger your navigation from this instance
    app.router = new Router();

    //Trigger the initial route, and enable the HTML5 History API, set the root folder to '/' by
    //default. Change in app.js
    Backbone.history.start({pushState: true, root: app.root});

    //All navigation that is relative should pass through the routers navigate method, to be processed.
    //If the link has a data-bypass attribute, bypass this entirely.
    $(document).on('click', 'a:not([data-bypass])', function(evt) {
        //Get the href attribute
        var href = this.getAttribute('href');

        //If the href exists and is a hash route, or does not have http: in the href
        //run through Backbone.
        if (href && (href.indexOf('#') === 0 || href.indexOf('http:') === 0)) {
            //Stop default event to ensure we do not page refresh
            evt.preventDefault();
            //Time to navigate!
            Backbone.history.navigate(href, true);
        }
    })
})
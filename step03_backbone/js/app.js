/*
MODELS AND COLLECTIONS
================================================== */
var ContentModel = Backbone.Model.extend({

});

var ContentCollection = Backbone.Collection.extend({

    url: "/api/v1/content",

    model: ContentModel

});

var DashboardModel = Backbone.Model.extend({

    urlRoot: "/api/v1/dashboard",

    id: "latest"    // We are only interested in the latest dashboard

});


/*
App View
================================================== */
var AppView = Backbone.View.extend({

    el: $("body"),

    // Events definition
    events: {
        "click a[href=#home]":      "handleNav",
        "click a[href=#chapter1]":  "handleNav",
        "click a[href=#chapter2]":  "handleNav",
        "click a[href=#chapter3]":  "handleNav",
        "click a[href=#chapter4]":  "handleNav",
        "click a[href=#chapter5]":  "handleNav",
        "click a[href=#chapter6]":  "handleNav",
        "click a[href=#about]":     "handleNav"
    },

    initialize: function() {

        // TODO: Explain
        _.bindAll(this, "render");

        // Create the content collection and model
        this.collection  = new ContentCollection();
        this.model = new ContentModel();

        // Create widget
        // Have in mind: The widget is self refreshing and takes care of the model itself
        this.dashboardWidget = new DashboardWidget({id: "#dashboard"});


        // http://stackoverflow.com/questions/5681246/backbone-js-rendering-view
        // Triggers current model update (stored in model) if collection is reset -> this triggers rendering
        // var self = this; 
        this.collection.on("reset", function() { this.setcurModel("#home"); }, this);
        this.model.on("change", function() { this.render(); }, this)

        // Views take care of their data and since we have only one view, we do it this way
        this.collection.fetch();
    },

    render: function() {

        // Load template
        var source = $("#appview-tpl").html();
        // Compile template
        var tpl = Handlebars.compile(source);

        // Assign data and render
        var html = tpl(this.model.toJSON());

        // Since we append to body, we have to clean up our stuff very carefully and make sure that we don't delete our script tags
        // Select all direct childs of this.el which are not a script
        $(this.el.tagName + " > *:not(script)").remove();

        $(this.el).append(html);
        this.dashboardWidget.render();    // Re-render dashboard after AppView is rendered
    },

    handleNav: function(e) {
        // Get hash tag, i.e. #chapter1, #chapter2, ...
        hash = $(e.target).attr("href");
        // Update the model
        this.setcurModel(hash);
        // Change the selected menu item
        $(".navbar li").removeClass("active");
        $('.navbar li a[href$="' + hash + '"]').parent().addClass("active"); // <- does this work in all browsers?
        // Ensure that the title changes color as well
        $("h1.header-title").css("color", $("li.active a").css("background-color"));
    },

    setcurModel: function(id) {
        this.model.clear({silent: true});
        this.model.set(this.collection.get(id));
    }

});




var DashboardWidget = Backbone.View.extend({

    initialize: function() {

        _.bindAll(this, "render");

        // Create model
        this.model = new DashboardModel();
        // Render the model every time the model has changed
        this.model.on("change", function() { this.render(); }, this);
        // Start data pulling, the widget is self-updating the content
        this.startPullingModel();

    },

    render: function() {

        // Get template
        var source = $("#dashboardwidget-tpl").html();
        // Compile template
        var tpl = Handlebars.compile(source);

        // Render widget only if there is data
        if (this.model.has("tweet_count")) {

            var html = tpl(this.model.toJSON());

            $(this.id).html(html);
        }
        else {

            // Render dummy data or a loading screen...

        }
    },

    startPullingModel: function() {

        // Initial pulling if model is empty
        if (!this.model.has("tweet_count")) {
            this.model.fetch({
                error: function(model, response) {
                    console.log("ERROR");
                },
                success: function(model, response) {
                    console.log("SUCCESS");
                }});

        }

        // Fetch model every 30 seconds
        var self = this; // maintain context
        window.setInterval(function() { 
            self.model.fetch({
                error: function(model, response) {
                    console.log("ERROR");
                },
                success: function(model, response) {
                    console.log("SUCCESS");
                }});
        }, 30000); 

    }

});

// jquery ready function is execute after the DOM is ready
$(document).ready(function() {

    var appView = new AppView(); 

});
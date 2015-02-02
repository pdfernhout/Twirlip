console.log("Need to do helpful stuff here");

require(["dijit/layout/ContentPane", "dijit/form/Textarea", "dojo/domReady!"], function(ContentPane, Textarea) {
    var contentPane = new ContentPane({
        content:"<p>I am initial content</p>"
    });
    
    document.body.appendChild(contentPane.domNode);
    contentPane.startup();
    
    var textarea = new Textarea({
        name: "myarea",
        value: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
        style: "width: 800px;"
    });
    
    textarea.placeAt(contentPane);
});
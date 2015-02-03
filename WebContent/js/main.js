console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "dijit/form/Textarea", "dojo/domReady!"],
function(Button, ContentPane, Textarea) {
    function saveClicked() {
        console.log("Save clicked");
    }
    
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
    
    contentPane.domNode.appendChild(document.createElement('br'));
    
    var saveButton = new Button({
        label: "Save",
        onClick: saveClicked
    });
    
    saveButton.placeAt(contentPane);

});
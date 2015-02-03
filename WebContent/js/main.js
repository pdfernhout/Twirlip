console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "js/pointrel20141201Client", "dijit/form/Textarea", "dojo/domReady!"],
function(Button, ContentPane, pointrel20141201Client, Textarea) {
    var textarea;
    
    function saveClicked() {
        var text = textarea.get("value");
        console.log("Save clicked");
        var metadata = {id: "test", contentType: "text/plain", committer: "test", timestamp: true};        
        pointrel20141201Client.storeInNewEnvelope(text, metadata, function(error, serverResponse) {
            if (error) {
                console.log("could not write new version:\n" + error);
                return;
            }
            var sha256HashAndLength = serverResponse.sha256AndLength;
            console.log("wrote sha256HashAndLength:", sha256HashAndLength);
        });
    }
    
    function loadClicked() {
        console.log("Load clicked");
        pointrel20141201Client.loadLatestEnvelopeForID("test", function(error, envelope) {
            if (error) {
                console.log("No stored versions could be loaded -- have any project versions been saved?");
                return;
            }
            console.log("envelope.contents", envelope.content);
            textarea.set("value", envelope.content);
        });
    }
    
    var contentPane = new ContentPane({
        content:"<p>Test of saving document</p>"
    });
    
    document.body.appendChild(contentPane.domNode);
    contentPane.startup();
    
    textarea = new Textarea({
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
    
    var loadButton = new Button({
        label: "Load",
        onClick: loadClicked
    });
    
    loadButton.placeAt(contentPane);
});
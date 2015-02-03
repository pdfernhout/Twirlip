console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "js/pointrel20141201Client", "dijit/form/Textarea", "dijit/form/TextBox", "dojo/domReady!"],
function(Button, ContentPane, pointrel20141201Client, Textarea, TextBox) {
    var defaultDocumentID = "test";
    
    var contentPane = new ContentPane({
        content:"<p>Test of saving document</p>"
    });
    
    document.body.appendChild(contentPane.domNode);
    contentPane.startup();
    
    contentPane.domNode.appendChild(document.createTextNode('ID: '));
    
    var textBox = new TextBox({
        name: "idTextBox",
        style: "width: 800px;"
    });
    
    textBox.set("value", defaultDocumentID);
    
    textBox.placeAt(contentPane);
    
    contentPane.domNode.appendChild(document.createElement('br'));
    contentPane.domNode.appendChild(document.createElement('br'));
    
    contentPane.domNode.appendChild(document.createTextNode('Content: '));
    contentPane.domNode.appendChild(document.createElement('br'));
    
    var textarea = new Textarea({
        name: "contentTextArea",
        style: "width: 800px;"
    });
    
    textarea.placeAt(contentPane);
    
    contentPane.domNode.appendChild(document.createElement('br'));
    
    var loadButton = new Button({
        label: "Load",
        onClick: loadClicked
    });
    
    loadButton.placeAt(contentPane);
    
    var saveButton = new Button({
        label: "Save",
        onClick: saveClicked
    });
    
    saveButton.placeAt(contentPane);
    
    function saveClicked() {
        var text = textarea.get("value");
        console.log("Save clicked");
        var documentID = textBox.get("value");
        if (!documentID) return alert("no document ID");
        var metadata = {id: documentID, contentType: "text/plain", committer: "tester", timestamp: true};        
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
        var documentID = textBox.get("value");
        if (!documentID) return alert("no document ID");
        pointrel20141201Client.loadLatestEnvelopeForID(documentID, function(error, envelope) {
            if (error) {
                console.log("No stored versions could be loaded -- have any project versions been saved?");
                return;
            }
            console.log("envelope.contents", envelope.content);
            textarea.set("value", envelope.content);
        });
    }
    
});
console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "js/pointrel20141201Client", "dijit/form/Textarea", "dijit/form/TextBox", "dojo/domReady!"],
function(Button, ContentPane, pointrel20141201Client, Textarea, TextBox) {
    var defaultDocumentID = "test";
    
    var mainContentPane = new ContentPane({
        content:"<p>Test of saving document</p>"
    });
    
    document.body.appendChild(mainContentPane.domNode);
    mainContentPane.startup();
    
    mainContentPane.domNode.appendChild(document.createTextNode('ID: '));
    
    var idTextBox = new TextBox({
        name: "idTextBox",
        style: "width: 800px;"
    });
    
    idTextBox.set("value", defaultDocumentID);
    
    idTextBox.placeAt(mainContentPane);
    
    mainContentPane.domNode.appendChild(document.createElement('br'));
    mainContentPane.domNode.appendChild(document.createElement('br'));
    
    mainContentPane.domNode.appendChild(document.createTextNode('Content: '));
    mainContentPane.domNode.appendChild(document.createElement('br'));
    
    var contentTextarea = new Textarea({
        name: "contentTextArea",
        style: "width: 800px;"
    });
    
    contentTextarea.placeAt(mainContentPane);
    
    mainContentPane.domNode.appendChild(document.createElement('br'));
    
    var loadButton = new Button({
        label: "Load",
        onClick: loadClicked
    });
    
    loadButton.placeAt(mainContentPane);
    
    var saveButton = new Button({
        label: "Save",
        onClick: saveClicked
    });
    
    saveButton.placeAt(mainContentPane);
    
    function saveClicked() {
        var text = contentTextarea.get("value");
        console.log("Save clicked");
        var documentID = idTextBox.get("value");
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
        var documentID = idTextBox.get("value");
        if (!documentID) return alert("no document ID");
        pointrel20141201Client.loadLatestEnvelopeForID(documentID, function(error, envelope) {
            if (error) {
                console.log("No stored versions could be loaded -- have any project versions been saved?");
                return;
            }
            console.log("envelope.contents", envelope.content);
            contentTextarea.set("value", envelope.content);
        });
    }
    
});
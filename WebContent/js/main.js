"use strict";
console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "js/pointrel20141201Client", "dijit/form/Textarea", "dijit/form/TextBox", "dojo/domReady!"],
function(Button, ContentPane, pointrel20141201Client, Textarea, TextBox) {

    var defaultDocumentID = "test";
    var defaultContentType = "text/plain";
    
    function addBreak(contentPane) {
        contentPane.domNode.appendChild(document.createElement('br'));
    }
    
    function addText(contentPane, text) {
        contentPane.domNode.appendChild(document.createTextNode(text));
    }
    
    function addHTML(contentPane, htmlText) {
        var childContentPane = new ContentPane({
            content: htmlText
        });
        
       childContentPane.placeAt(contentPane);
       return childContentPane;
    }
    
    // Creating interface
    var mainContentPane = new ContentPane({
    });
    
    document.body.appendChild(mainContentPane.domNode);
    mainContentPane.startup();
    
    addHTML(mainContentPane, '<b>Simple editor for content</b>');
    
    addText(mainContentPane, 'ID: ');
    
    var idTextBox = new TextBox({
        name: "idTextBox",
        style: "width: 800px;"
    });
     
    idTextBox.set("value", defaultDocumentID);
    
    idTextBox.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
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
    
    addBreak(mainContentPane);
    
    addText(mainContentPane, 'Content type: ');
    
    var contentTypeTextBox = new TextBox({
        name: "contentTypeTextBox",
        style: "width: 800px;"
    });
     
    contentTypeTextBox.set("value", defaultContentType);
    
    contentTypeTextBox.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    addText(mainContentPane, 'Content: ');
    addBreak(mainContentPane);
    
    var contentTextarea = new Textarea({
        name: "contentTextArea",
        style: "width: 800px;"
    });
    
    contentTextarea.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    addText(mainContentPane, 'Hash: ');
    
    var hashTextBox = new TextBox({
        name: "hashTextBox",
        style: "width: 800px;"
    });
     
    hashTextBox.set("value", "");
    
    hashTextBox.placeAt(mainContentPane);
    
    var loadFromHashButton = new Button({
        label: "Load from hash",
        onClick: loadFromHashClicked
    });
    
    loadFromHashButton.placeAt(mainContentPane);

    addBreak(mainContentPane);
    
    var listVersionsButton = new Button({
        label: "List versions",
        onClick: listVersionsClicked
    });
    
    listVersionsButton.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    var versionsContentPane = addHTML(mainContentPane, "Versions: ");
    
    function saveClicked() {
        var text = contentTextarea.get("value");
        console.log("Save clicked");
        var documentID = idTextBox.get("value");
        if (!documentID) return alert("no document ID");
        var contentType = contentTypeTextBox.get("value");
        if (!contentType) return alert("no content type");
        var metadata = {id: documentID, contentType: contentType, committer: "tester", timestamp: true};        
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
                console.log("No stored versions could be loaded -- have any versions been saved?");
                return;
            }
            console.log("envelope.contents", envelope.content);
            contentTypeTextBox.set("value", envelope.contentType);
            contentTextarea.set("value", envelope.content);
            hashTextBox.set("value", envelope.__sha256HashAndLength);
            versionsContentPane.set("content", "");
        });
    }
    
    function loadFromHashClicked() {
        console.log("Load from hash clicked");
        var documentHash = hashTextBox.get("value");
        if (!documentHash) return alert("no document hash");
        pointrel20141201Client.fetchEnvelope(documentHash, function(error, envelope) {
            if (error) {
                console.log("No stored versions could be loaded -- have any versions been saved?");
                return;
            }
            console.log("envelope.contents", envelope.content);
            contentTypeTextBox.set("value", envelope.contentType);
            contentTextarea.set("value", envelope.content);
        });
    }
    
    function listVersionsClicked() {
        console.log("List versions clicked");
        var documentID = idTextBox.get("value");
        if (!documentID) return alert("no document ID");
        pointrel20141201Client.queryByID(documentID, function(error, data) {
            if (error) {
                console.log("No stored versions for item could be loaded -- have any versions been saved?");
                return;
            }
            console.log("data", data);
            versionsContentPane.set("content", "<pre>" + JSON.stringify(data, null, 2) + "</pre>");
        });
    }
    
    document.getElementById("startup").style.display="none";
});
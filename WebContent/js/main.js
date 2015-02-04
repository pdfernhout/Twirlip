"use strict";
console.log("Starting Twirlip");

require(["dijit/form/Button", "dijit/layout/ContentPane", "js/pointrel20141201Client", "dijit/form/SimpleTextarea", "dijit/form/TextBox", "dojo/domReady!"],
function(Button, ContentPane, pointrel20141201Client, SimpleTextarea, TextBox) {

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
    
    // ID field
    
    addText(mainContentPane, 'ID: ');
    
    var idTextBox = new TextBox({
        name: "idTextBox",
        style: "width: 800px;"
    });
     
    idTextBox.set("value", defaultDocumentID);
    
    idTextBox.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    // Load and save buttons
    
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
    
    // Content type field
    
    addText(mainContentPane, 'Content type: ');
    
    var contentTypeTextBox = new TextBox({
        name: "contentTypeTextBox",
        style: "width: 800px;"
    });
     
    contentTypeTextBox.set("value", defaultContentType);
    
    contentTypeTextBox.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    // Content entry
    
    addText(mainContentPane, 'Content: ');
    addBreak(mainContentPane);
    
    var contentTextarea = new SimpleTextarea({
        name: "contentTextArea",
        style: "width: 800px;"
    });
    
    contentTextarea.placeAt(mainContentPane);
    
    // Reference loading
    
    addBreak(mainContentPane);
    addBreak(mainContentPane);
    addHTML(mainContentPane, "<hr>");
    
    addText(mainContentPane, 'Reference: ');
    
    var referenceTextBox = new TextBox({
        name: "referenceTextBox",
        style: "width: 800px;"
    });
     
    referenceTextBox.set("value", "");
    
    referenceTextBox.placeAt(mainContentPane);
    
    addBreak(mainContentPane);
    
    var loadFromReferenceButton = new Button({
        label: "Load version from reference hash and length",
        onClick: loadFromReferenceClicked
    });
    
    loadFromReferenceButton.placeAt(mainContentPane);
    
    // List versions

    var listVersionsButton = new Button({
        label: "List versions",
        onClick: listVersionsClicked
    });
    
    listVersionsButton.placeAt(mainContentPane);
    
    // List IDs

    var listAllIDsButton = new Button({
        label: "List all IDs",
        onClick: listAllIDsClicked
    });
    
    listAllIDsButton.placeAt(mainContentPane);
    
    // Output for versions and IDs
    
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
            referenceTextBox.set("value", envelope.__sha256HashAndLength);
            versionsContentPane.set("content", "");
        });
    }
    
    function loadFromReferenceClicked() {
        console.log("Load from hash clicked");
        var documentReference = referenceTextBox.get("value");
        if (!documentReference) return alert("no document hash");
        pointrel20141201Client.fetchEnvelope(documentReference, function(error, envelope) {
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
    
    function listAllIDsClicked() {
        console.log("List versions clicked");
        var documentID = idTextBox.get("value");
        if (!documentID) return alert("no document ID");
        pointrel20141201Client.fetchIDs(function(error, data) {
            if (error) {
                console.log("Error retrieving list of all IDs");
                return;
            }
            console.log("data", data);
            versionsContentPane.set("content", "<pre>" + JSON.stringify(data, null, 2) + "</pre>");
        });
    }
    
    document.getElementById("startup").style.display="none";
});
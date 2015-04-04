"use strict";
console.log("Starting Twirlip");

require([
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "js/mimeTypes.js",
    "js/pointrel20141201Client",
    "dijit/form/SimpleTextarea",
    "dijit/form/TextBox",
    "dojox/form/Uploader",
    "dojo/domReady!"
], function(
    Button,
    ContentPane,
    mimeTypes,
    pointrel20141201Client,
    SimpleTextarea,
    TextBox,
    Uploader
) {

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
    
    // Importing
    
    var fileUploaderButton = new Uploader({
        label: "Import from file, converting binary data as base64-encoded text if needed"
    });
    
    fileUploaderButton.on('change', handleFileSelect);
    
    fileUploaderButton.placeAt(mainContentPane);
    
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
    
    addBreak(mainContentPane);
    
    // Reference loading
    
    // addBreak(mainContentPane);
    // addBreak(mainContentPane);
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
    
    var outputContentPane = addHTML(mainContentPane, "Versions: ");
    
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
            referenceTextBox.set("value", sha256HashAndLength);
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
            // outputContentPane.set("content", "");
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
            outputContentPane.set("content", "All versions for: <b>" + documentID + "</b><br><pre>" + JSON.stringify(data, null, 2) + "</pre>");
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
            outputContentPane.set("content", "List of all IDs:<br><pre>" + JSON.stringify(data, null, 2) + "</pre>");
        });
    }
    
    // Conversion function from: http://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
    function _arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        return window.btoa( binary );
    }
    
    function startsWith(str, prefix) {
        return str.indexOf(prefix) === 0;
    }
    
    function isTextContentType(contentType) {
        if (startsWith(contentType, "text/")) return true;
        if (contentType === "application/javascript") return true;
        return false;
    }
    
    function handleFileSelect() {
        var files = fileUploaderButton._files;
        console.log("handleFileSelect", files);
        
        if (files.length !== 1) return console.log("expected exactly one file for change");
        
        var theFile = files.item(0);
        console.log("file name", theFile.name, theFile);
        var contentType = mimeTypes.lookup(theFile.name);
        var convertToBase64 = !isTextContentType(contentType);
        var reader = new FileReader();
        reader.onload = function () {
            console.log("result", reader.result);
            var content;
            if (convertToBase64) {
                var base64Text = _arrayBufferToBase64(reader.result);
                content = base64Text;
                contentType = "base64::" + contentType;
            } else {
                content = reader.result;
            }
            idTextBox.set("value", theFile.name);
            contentTextarea.set("value", content);
            contentTypeTextBox.set("value", contentType);
        };
        console.log("about to call read as array buffer");
        if (convertToBase64) {
            reader.readAsArrayBuffer(theFile);
        } else {
            reader.readAsText(theFile);
        }
    }
    
    document.getElementById("startup").style.display="none";
});
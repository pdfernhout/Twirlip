// Test at: http://localhost:8080/pointrel/pointrel-app/
/*jslint node: true */
"use strict";

// Standard nodejs modules

var fs = require('fs');
var http = require('http');
var https = require('https');

// The modules below require npm installation

var express = require('express');
var bodyParser = require('body-parser');

// the server library
var pointrel20141201Server = require("./pointrel20141201Server");

// Main code

console.log("Twirlip server for nodejs started: " + Date());

console.log("__dirname", __dirname);

var app = express();

var logger = function(request, response, next) {
    console.log("Request:", request.method, request.url);
    next();
};

app.use(logger);

// TODO: May need to move this and split up JSON parsing functionality
// TODO: Could there be an issue with bodyParser with undeleted temp files?
// includes support to parse JSON-encoded bodies (and saving the rawBody)
pointrel20141201Server.initialize(app);
// app.use(bodyParser.json());

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Application routes

app.use("/$", function(req, res) {
    res.redirect('/index.html');
});

app.use("/", express.static(__dirname + "/../WebContent"));

function getLatestIndexEntry(indexEntries) {
    var latest = null;
    for (var i = 0; i < indexEntries.length; i++) {
        var indexEntry = indexEntries[i];
        if (!latest || indexEntries[i].timestamp >= latest.timestamp)
            latest = indexEntries[i];
    }
    return latest;
}

app.post("/survey/questions/:surveyID", function (request, response) {
    var surveyID = request.params.surveyID;
    var indexEntries = pointrel20141201Server.referencesForTag(surveyID);
    if (!indexEntries) {
        return response.json({status: "FAILED", message: "Survey is not defined", questions: null});
    }
    var indexEntry = getLatestIndexEntry(indexEntries);
    if (!indexEntry) {
        var errorMessage = "Survey definitions are missing timestamps";
        console.log("ERROR: Should never get here", errorMessage);
        return response.json({status: "FAILED", message: errorMessage, questions: null});
    }
    pointrel20141201Server.fetchContentForReference(indexEntry.sha256AndLength, function(error, data) {
        if (error) {
            console.log("ERROR reading question file: ", error);
            return response.json({status: "FAILED", message: error, questions: null});
        }
        var questionsEnvelope;
        try {
            questionsEnvelope = JSON.parse(data);
        } catch (parseError) {
            return response.json({status: "FAILED", message: "Parse error: " + parseError, questions: null});
        }
        // TODO: Should this really have to parse the question object? Maybe should let client do it?
        return response.json({status: "OK", message: "Retrieved survey", questions: questionsEnvelope.content});
    });
});

function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

function getPointrelContent(request, response) {
    var localPath = request.params.localPath;
    var indexEntries = pointrel20141201Server.referencesForID(localPath);
    if (!indexEntries) {
        return response.json({status: "FAILED", message: "local path is not defined", localPath: localPath});
    }
    var indexEntry = getLatestIndexEntry(indexEntries);
    pointrel20141201Server.fetchContentForReference(indexEntry.sha256AndLength, function(error, data) {
        if (error) {
            console.log("ERROR reading file: ", error);
            return response.json({status: "FAILED", message: error});
        }
        var envelope;
        try {
            envelope = JSON.parse(data);
        } catch (parseError) {
            return response.json({status: "FAILED", message: "Parse error: " + parseError});
        }
        var contentType = envelope.contentType;
        var content = envelope.content;
        if (startsWith(contentType.toLowerCase(), "base64::")) {
            contentType = contentType.substring(8);
            content = new Buffer(content, 'base64');
        }
        response.setHeader('content-type', contentType);
        return response.end(content);
    });
}

app.use("/:localPath(*)", getPointrelContent);

// TODO: For developer testing only; remove in final version
app.use("/dojo-debug", express.static(__dirname + "/../../PNIWorkbookLibraries/dojo-release-1.10.0-src"));

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Create an HTTP service.
var server = http.createServer(app).listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Twirlip app listening at http://%s:%s", host, port);
});

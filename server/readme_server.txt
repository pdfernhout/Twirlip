To use the server for testing;

Install node.js

To run, cd to this directory and type:

$ node TwirlipServer.js

To have server restart when making code changes, first install "supervisor":

$ npm install -g supervisor

After that, you can run this which will restart the server when the source changes to the server file:

$ supervisor TwirlipServer.js



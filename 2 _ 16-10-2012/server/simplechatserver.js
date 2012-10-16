// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
 // Clients with an id and a profile
 var clients = {};
 function newClient(connection, profile) {
    // Generate unique ID
    var date = new Date();
    var id = (date.getTime()*1000) + date.getUTCMilliseconds();
    clients[id] = {connection:connection,profile:profile};
    return id;
 }
 // Groups
 var groups = {};
 function newGroup(name) {
    groups[name] = groups[name] || {
        history : [], // latest 100 messages
        clients : []  // list of currently connected client-ids (users)
    }
 }
 // Create common global group for all clients
 newGroup("global");

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you could check 'request.origin' to make sure that
    // client is connecting from your website (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    // we need to know client index to remove them on 'close' event
    var index = newClient(connection,{}); // Add to clients
    groups.global.clients.push(index); // Add client id to global group

    console.log((new Date()) + ' Connection accepted.');

    // TODO: only send on request
    // send back chat history
    if (groups.global.history.length > 0) {
        connection.sendUTF(JSON.stringify( { group: 'global', type: 'history', data: groups.global.history} ));
    }

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            var json = JSON.parse(message.utf8Data);
            if (json.type == "profile") {
                if (json.profile) {
                    // update profile
                    console.log("updating profile for " + index + ":", json.profile);
                    for(var key in json.profile) {
                        clients[index].profile[key] = json.profile[key];
                    }
                }
                if (json.client !== undefined) {
                    // return profile info of client
                    if (clients[json.client] && clients[json.client].profile) {
                        var m = {type:"profile",client:json.client,time:new Date().getTime(),profile:clients[json.client].profile};
                        connection.sendUTF(JSON.stringify(m));
                    }
                } else {
                    // return profile for currently connected client
                    var m = {type:"yourprofile",client:index,time:new Date().getTime(),profile:clients[index].profile};
                    connection.sendUTF(JSON.stringify(m));
                }
            }
            if (json.type == "message") {
                var m = {type:"message",client:index,time:new Date().getTime(),message:json.message};
                console.log((new Date()) + ' Received Message from ' + index);
                groups.global.history.push(m);
                groups.global.history.slice(-100); // Only store last 100 messages
                // broadcast message to all connected clients
                for (var i in clients) {
                    clients[i].connection.sendUTF(JSON.stringify(m));
                }
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer "
            + connection.remoteAddress + " disconnected.");
        // remove user from the list of connected clients
        delete clients[index];
        // Remove from all groups
        // TODO
    });

});
$(function () {
    "use strict";

    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    // my profile
    var profile = {};
    // all profiles
    var profiles = {};

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    /**
     * Helper function for escaping input strings
     */
    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    //var connection = new WebSocket('ws://chatserver.eu01.aws.af.cm:1337/');
    var connection = new WebSocket('ws://fabricasapiens.nl:8080');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>' } ));
        console.log(error);
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        console.log("received message ", json);

        if (json.type === 'history') { // entire message history
            // insert every single message to the chat window
            for (var i=0; i < json.data.length; i++) {
                var m = json.data[i];
                var author = m.client;
                var profile = profiles[author];
                if (profile) {
                    author = profile.userName;
                } else {
                    // Fetch for next time
                    connection.send(JSON.stringify({type:"profile", client:author}));
                }
                if (m.message.type === "text") {
                    addMessage(author, m.message.data, new Date(m.time));
                }
            }
        } else if (json.type === 'message') { // it's a single message
            input.removeAttr('disabled').focus(); // let the user write another message
            // Check profile information for this user
            var author = json.client;
            var profile = profiles[author];
            if (profile) {
                author = profile.userName;
            } else {
                // Fetch for next time
                connection.send(JSON.stringify({type:"profile", client:author}));
            }
            addMessage(author, json.message.data, new Date(json.time));
        } else if (json.type === 'profile') { // it's profile information
            input.removeAttr('disabled').focus(); // let the user write another message
            var i = json.client;
            profiles[i] = json.profile;
        } else if (json.type === 'yourprofile') { // it's our profile information
            input.removeAttr('disabled').focus(); // let the user write another message
            var i = json.client;
            profiles[i] = json.profile;
            status.text(json.profile.userName + ': ');
        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // we know that the first message sent from a user is their name
            if (!profile.userName) {
                profile.userName = msg;
                connection.send(JSON.stringify({type:"profile", profile:{userName:msg}}));
            } else {
                // send the message as an ordinary text
                connection.send(JSON.stringify({type:"message", message:{type:"text", data:msg}}));
            }
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                                                 + 'with the WebSocket server.');
        }
    }, 3000);

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, dt) {
        content.append('<p><span>' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + htmlEntities(message) + '</p>');
    }
});
$(function () {
    "use strict";

    var content = $('#content');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
                                    + 'support WebSockets.'} ));

        return;
    }

	// TODO Do connection stuff..
    var connection = null;
	

    // TODO Implement message handling...
    connection.onmessage = function (message) {
		
		// TODO Inspect message and try to understand how it behaves...
		console.log(message);

    };

	$('button').click(function() {
		connection.send(JSON.stringify({type:"message", message:{type:"text", data: $('#msg').val()}}));
		
		// TODO this is how you put a message on the window...
		addMessage('me', $('#msg').val(), new Date());
	});
	
	// TODO Send your profile to the server (once!!!)
	function sendProfile() {
		connection.send(JSON.stringify({type:"profile", profile:{userName: $('#name').val()}}));
	}

    /**
     * Add message to the chat window
     */
    function addMessage(author, message, dt) {
        content.append('<p><span>' + author + '</span> @ ' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ': ' + message + '</p>');
    }
});
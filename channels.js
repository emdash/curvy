/* channels.js
 *
 * Multiplexed JSON messages.
 *
 * A jsonSocket that supports multiplexing into multiple channels.
 * Applications may associate handlers with both channels and the
 * underlying socket.
 *
 * Requires: SockJS jsonSocket.js
 */


var channels = (function () {
"use strict";

function channel(name, server) {
    var handlers = {};

    function handleMessage(msg) {
	if (handlers[msg.type]) {
	    handlers[msg.type](msg);
	}
    }

    function sendMessage(msg) {
	server.send({type: "send",
		     name: name,
		     content: msg});
    }

    function setMsgHandler(msg, handler) {
	handlers[msg] = handler;
    }

    function leave() {
	server.leave(name);
    }

    return {
	leave: leave,
	handle: handleMessage,
	send: sendMessage,
	setMsgHandler: setMsgHandler
    };
}


function socket(url) {
    var sock = jsonSocket.socket(url);
    var channels = {};

    function handleChannelMessage(message) {
	if (channels[message.name]) {
	    channels[message.name].handle(message.content);
	}
    }

    sock.join = function (name, handler) {
	if (!channels[name]) {
	    sock.send({type: "join",
		       name: name});
	    channels[name] = channel(name, sock);
	} else {
	    console.log("channels.socket: already joined to " + name);
	}

	return channels[name];
    };

    sock.leave = function (name) {
	sock.send({type: "leave",
		   name: name});
	delete channels[name];
    };

    sock.setMsgHandler("channel-message", handleChannelMessage);

    return sock;
}

return {
    socket: socket
};

})();
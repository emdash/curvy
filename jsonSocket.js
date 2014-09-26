/* jsonSocket.js
 *
 * High-level messaging protocol
 *
 * Wraps a websocket / SockJS socket in a simple json-based protocol.
 * messages are encoded as a single JSON object.  Applications
 * associate handlers with messgaes based on the type field of the
 * message.
 *
 * Requires: SockJS
 */

var jsonSocket = (function () {
"use strict";

function socket(url) {
    var sock = new SockJS(url);
    var handlers = {};

    sock.onmessage = function (e) {
	var message = JSON.parse(e.data);
	console.log("-->" + e.data);
	if (handlers[message.type]) {
	    handlers[message.type](message);
	}
    };

    function send(msg) {
	msg = JSON.stringify(msg);
	console.log("<--" + msg);
	sock.send(msg);
    };

    function setMsgHandler(message, handler) {
	handlers[message] = handler;
    };

    function setErrHandler(handler) {
	sock.onclose = handler;
    };

    function setConnectHandler(handler) {
	sock.onopen = handler;
    };

    return {
	send: send,
	setMsgHandler: setMsgHandler,
	setErrHandler: setErrHandler,
	setConnectHandler: setConnectHandler
    };
}

return {
    socket: socket
};

})();
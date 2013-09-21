// console emulation

var msgArea = document.getElementById("msgArea");

function print() {
    var i;
    var msgArea = document.getElementById("msgArea");
    var elem = el("div");

    for (i = 0; i < arguments.length; i++) {
	elem.appendChild(text(arguments[i]));
    }
    msgArea.insertBefore(elem, msgArea.firstChild);
}


// css helpers

function url(base) {
    var i;
    var ret = "url(" + base + ")";
    for (i = 1; i < arguments.length; i++) {
	ret = ret + " " + arguments[i];
    }
    return ret;
}

function color (r, g, b, a) {
    return "rgba(" + (r + ", " +
		     g + ", " +
		     b + ", " +
		     a + ")");
}


// closure library

function nullfunc() {};

function compose() {
    var funcs = arguments;
    return function () {
	var i;
	var ret;
	for (i = 0; i < funcs.length; i++) {
	    ret = funcs[i].apply(this, arguments);
	}
	return ret;
    };
}


// dom manipulation helpers

function text(t) {
    return document.createTextNode(t);
}

function el () {
    return document.createElement.apply(document, arguments);
}

function get () {
    return document.getElementById.apply(document, arguments);
}

function div (name) {
    ret = el("div");
    ret.appendChild(document.createTextNode(name));
    return ret;
}

function unparent(node) {
    node && node.parentNode && node.parentNode.removeChild(node);
}


// element position helpers

function distToElem(elt, x, y) {
    var dx = (elt.offsetLeft + 0.5 * elt.offsetWidth) - x;
    var dy = (elt.offsetTop  + 0.5 * elt.offsetHeight) - y;
    return Math.sqrt(dx * dx + dy * dy);
}

function move(elt, x, y) {
    if (!elt.wrapper) {
	elt.wrapper = el("span");
	elt.wrapper.style.position = "absolute";
	document.body.appendChild(elt.wrapper);
	elt.wrapper.appendChild(elt);
    }
    elt.wrapper.style.top = y;
    elt.wrapper.style.left = x;
}

function unmove(elt) {
    if (elt.wrapper) {
	unparent(elt.wrapper);
	elt.wrapper = null;
    }
}


// mathy stuff

function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomChoice(array) {
    return array[Math.floor(Math.abs(Math.random() * array.length))];
}


// XHR Request

function request(method, uri, closure) {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function () {
	if (req.readyState == 4) {
	    closure(req.responseText);
	}
    };

    req.open(method, uri, true,
	     login.value,
	     password.value);

    req.send();
}


// Utilites for Mobile Browsers

function isTouchDevice(){
    try {
	document.createEvent("TouchEvent");
	return true;
    } catch(e) {
	return false;
    }
}

function mobileScrollFix(element) {
    var scrollStartPos = 0;

    function touchstart(event) {
	scrollStartPos = this.scrollTop + event.touches[0].pageY;
    }

    function touchmove(event) {
	this.scrollTop = scrollStartPos - event.touches[0].pageY;
	event.preventDefault();
    }

    if (isTouchDevice()) {
	element.ontouchstart = touchstart;
	element.ontouchmove = touchmove;
    }
}

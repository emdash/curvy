var msgArea = document.getElementById("msgArea");

function print() {
    var text = "";
    var i;
    var msgArea = document.getElementById("msgArea");

    for (i = 0; i < arguments.length; i++) {
	text = text + " " + arguments[i];
    }
    msgArea.insertBefore(div(document.createTextNode(text)),
			 msgArea.firstChild);
}

function url(base) {
    return "url(http://twitter.com/api/users/profile_image/" + base +
	") no-repeat";
}

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

function clamp (value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomChoice(array) {
    return array[Math.floor(Math.abs(Math.random() * array.length))];
}

function distToElem(elt, x, y) {
    var dx = (elt.offsetLeft + 0.5 * elt.offsetWidth) - x;
    var dy = (elt.offsetTop  + 0.5 * elt.offsetHeight) - y;
    return Math.sqrt(dx * dx + dy * dy);
}

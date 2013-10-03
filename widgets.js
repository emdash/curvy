/* widgets.js
 *
 * Reusable, MVC-friendly components.
 *
 * toggle - Implements the behavior for a stylable toggle button. You
 * call toggle.button() on an arbitrary element to transform it into a
 * toggle button.  Alternatively, toggle.button is automatically
 * called on all <toggle-button> elements found in the document when
 * loading is complete.
 *
 * The toggle button is MVC-friendly, and can proxy for an arbitrary
 * boolean attribute of an arbitrary element. The default is the
 * "enabled" property on the toggle button itself. This allows for
 * re-routing the event flow into a complete MVC round-trip.
 *
 * Requires: util.js
 */


var widgets = (function () {
"use strict";

function readyHandler() {
    var i;
    var elements;
    elements = document.getElementsByTagName("toggle-button");
    for (i = 0; i < elements.length; i++) {
	console.log("Converting to toggle button: ", elements[i]);
	toggleButton(elements[i]);
    };
}

whenReady(readyHandler);

function toggleButton(ret, target, attr) {
    var observer;
    var enabledText = ret.getAttribute("enabledText") || "On";
    var disabledText = ret.getAttribute("disabledText") || "Off";

    target = target
	|| eval(ret.getAttribute("target"))
	|| ret;

    attr = attr
	|| ret.getAttribute("attr")
	|| "priv-enabled";

    function onMutation() {
	var value = ret.getValue();
	ret.setAttribute("enabled", ret.getValue());
	ret.innerHTML = value ? enabledText : disabledText;
    }

    DOMAttrModified(target, attr, onMutation);

    ret.onclick = ret.onclick || function () {
	ret.toggle();
    };

    ret.getValue = function () {
	return target.getAttribute(attr) == "true" ? true : false;
    };

    ret.toggle = function () {
	var value = ret.getValue();
	target.setAttribute(attr, !value);
    };

    return ret;
};

})();
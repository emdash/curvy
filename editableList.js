/* editableList.js
 *
 * An MVC and ajax-friendly list controler with user-editable items.
 *
 * editableList.list - Transforms an element into an editable list.
 *
 *  Once "listified", the element will ensure that there is exactly
 *  one child element for each item in its model.
 *
 *  Any html element that can contain children can become an editable
 *  list by calling editableList.list() on it directly.
 *
 *  An alternative way to create editable lists is with the
 *  <editable-list> tag. This module registers a page onload handler
 *  which will automagically call editableList.list() on the
 *  element. You may wish to include editableList.css to apply a basic
 *  default style.
 *
 * editableList.item - A factory function to create editable list
 *  items.
 *
 *  The default implementation presents a plain list item with no
 *  additional controls. It can be customized if different behavior is
 *  desired.
 *
 *  When the "edit mode" of the parent list is truthy, list items are
 *  made directly editable. The default behavior is to update the list
 *  model when an item loses focus. The current implementation also
 *  requires that the browser support the contentEditable attribute
 *  correctly.
 *
 *  List Item Interface:
 *
 *  + onEnterKey(): called when the enter key is pressed on the
 *   element. The default behavior is to blur the item, thereby
 *   commiting changes to the model.
 *
 *  + getContent(): returns the current content of the item.
 *
 *  + setContent(): updates the current content of the item.
 *
 *  + selectAll():  selects the contents of the item
 *
 *  + setEditable(editable): sets the edit state of the item. should be
 *    boolean true or false
 *
 *
 * Requires: util.js
 */


var editableList = (function () {
"use strict";

function readyHandler() {
    var i;
    var elements;

    elements = document.getElementsByTagName("editable-list");
    for (i = 0; i < elements.length; i++) {
	console.log("Converting to editable list: ", elements[i]);
	editableList(elements[i]);
    }
};

whenReady(readyHandler);

function editableListItem(list, model, items) {
    var item = el("div");
    var content;

    item.className = "listItem";

    item.onkeypress = function (evt) {
	switch (evt.keyCode) {
	case 13:
	    item.onEnterKey();
	    evt.preventDefault();
	    break;
	};
    };

    item.onfocus = function (evt) {
	list.setSelected(item);
	content = item.getContent();
	setTimeout(item.selectAll, 1);
    };

    item.onblur = function (evt) {
	if (item.innerHTML === content) {
	    return;
	}
	item.setEditable(false);
	model.update(items.indexOf(item), {content: item.getContent()});
    };

    item.onEnterKey = function (content) {
	item.blur();
    };

    item.getContent = function (content) {
	return item.innerHTML;
    };

    item.selectAll = function () {
	document.getSelection().selectAllChildren(item);
    };

    item.setContent = function (content) {
	item.innerHTML = content;
    };

    item.setEditable = function (editable) {
	item.setAttribute("contentEditable", editable);
    };

    return item;
}


function editableList(ret, model, listItem) {
    var items = [];
    var selected;
    var editable;
    var handlers;

    model = model
	|| eval(ret.getAttribute("model"))
	|| listModel("New Item");

    console.log(model);

    listItem = listItem
	|| eval(ret.getAttribute("listItem"))
	|| editableListItem;

    function itemAdded(index, attrs) {
	var item = listItem(ret, model, items);
	var attr;

	console.log("item added " + attrs.content);

	ret.insertBefore(item, items[index]);
	items.splice(index, 0, item);

	for (attr in attrs) {
	    itemChanged(index, attr, attrs[attr]);
	}

	item.setEditable(ret.getEditMode());
	item.focus();
    }

    function itemChanged(index, attr, value) {
	var item = items[index];

	if (!item) {
	    return;
	}

	if (attr == "content") {
	    item.setContent(value);
	    item.setEditable(ret.getEditMode());
	} else {
	    item.setAttribute(attr, value);
	}
    }

    function itemRemoved(index) {
	var item = items[index];
	var unused = { focus: function () {}};
	var hilight;

	items.splice(index, 1);

	if (item === selected) {
	    hilight = (item.nextSibling
			|| item.previousSibling
			|| unused);
	    hilight.focus && hilight.focus();
	}

	item && ret.removeChild(item);
    }

    ret.append = function () {
	model.insert(items.indexOf(selected) + 1, {});
    };

    ret.remove = function () {
	if (items.length) {
	    model.remove(items.indexOf(selected));
	}
    };

    ret.getEditMode = function (mode) {
	return ret.getAttribute("editable") == "true";
    };

    ret.setEditMode = function (mode) {
	var li;

	ret.setAttribute("editable", mode);

	for (li = ret.firstChild; li !== null; li = li.nextSibling) {
	    li.setEditable && li.setEditable(mode);
	}
    };

    ret.setModel = function (newModel) {
	var i = 0;
	var editMode = ret.getEditMode();

	ret.setEditMode(false);

	if (handlers) {
	    model.itemAdded.disconnect(handlers.added);
	    model.itemChanged.disconnect(handlers.changed);
	    model.itemRemoved.disconnect(handlers.removed);
	    handlers = null;
	}

	model = newModel;
	items = [];
	ret.innerHTML = "";

	if (model) {
	    handlers = {};

	    handlers.added = model.itemAdded.connect(itemAdded);
	    handlers.changed = model.itemChanged.connect(itemChanged);
	    handlers.removed = model.itemRemoved.connect(itemRemoved);

	    model.forEach(function (item) { itemAdded(i++, item); });
	}

	ret.setEditMode(editMode);
    };

    ret.setSelected = function (item) {
	selected = item;
    };

    ret.setModel(model);

    return ret;
}


function listModel(defaultItem) {
    var items = [];
    var ret = {};

    ret.itemChanged = signal();
    ret.itemAdded = signal();
    ret.itemRemoved = signal();

    ret.forEach = function (closure) {
	items.forEach(closure);
    };

    ret.getItem = function (i) {
	return items[i];
    };

    ret.getLength = function () {
	return items.length;
    };

    ret.update = function (index, attrs) {
	var attr;
	var value;

	for (attr in attrs) {
	    value = attrs[attr];
	    items[index][attr] = value;
	    ret.itemChanged.emit(index, attr, value);
	}
    };

    ret.insert = function(index, attrs) {
	console.log("insert");
	attrs.content = attrs.content || defaultItem;
	items.splice(index, 0, attrs);
	ret.itemAdded.emit(index, attrs);
    };

    ret.remove = function (index) {
	items.splice(index, 1);
	ret.itemRemoved.emit(index);
    };

    return ret;
}

return {
    list: editableList,
    model: listModel,
    item: editableListItem
};

})();
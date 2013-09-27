var editableList = (function () {
"use strict";

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
	item.contentEditable = editable;
    };

    return item;
}


function editableList(model, ret, listItem) {
    var items = [];
    var selected;
    var editing = "false";

    function itemAdded(index, attrs) {
	var item = listItem(ret, model, items);
	var attr;

	console.log("item added " + attrs.content);

	ret.insertBefore(item, items[index]);
	items.splice(index, 0, item);

	for (attr in attrs) {
	    model.itemChanged(index, attr, attrs[attr]);
	}

	item.setEditable(editing);
	item.focus();
    }

    function itemChanged(index, attr, value) {
	var item = items[index];

	if (!item) {
	    return;
	}

	if (attr == "content") {
	    item.setContent(value);

	    if (editing == "true") {
		item.setEditable(true);
	    }
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
	return editing;
    };

    ret.setEditMode = function (mode) {
	var li;
	editing = mode;
	for (li = ret.firstChild; li !== null; li = li.nextSibling) {
	    li.setEditable(mode);
	}
    };

    ret.setModel = function (newModel) {
	model = newModel;

	if (model) {
	    model.itemAdded = itemAdded;
	    model.itemChanged = itemChanged;
	    model.itemRemoved = itemRemoved;
	}

	ret.innerHTML = "";
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

    ret.itemChanged = function () {};
    ret.itemAdded = function () {};
    ret.itemRemoved = function () {};

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
	    ret.itemChanged(index, attr, value);
	}
    };

    ret.insert = function(index, attrs) {
	console.log("insert");
	attrs.content = attrs.content || defaultItem;
	items.splice(index, 0, attrs);
	ret.itemAdded(index, attrs);
    };

    ret.remove = function (index) {
	items.splice(index, 1);
	ret.itemRemoved (index);
    };

    return ret;
}


return {
    list: editableList,
    model: listModel,
    item: editableListItem
};

})();
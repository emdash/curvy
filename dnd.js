var dnd = (function() {
var nelems;
var curElem;
var toInsert;
var ret = {};

function cancel(e) {
    if (e.preventDefault) {
	e.preventDefault();
    }
    return false;
}

function makeElement(data) {
    var ret = document.createElement('div');
    ret.style.background = url(data);
    ret.id = data + nelems++;
    var i = 0;
    makeDraggable(ret, "move");
    return ret;
}

function makeDraggable(elt, effect) {
    elt.draggable = true;
    elt.dropEffect = effect;

    function start (e) {
	e.dataTransfer.setData('Text', elt.id);
	e.dataTransfer.allowedEffect = effect;
	curElem = this;
    }

    function end(e) {
	curElem = null;
    }

    elt.addEventListener('dragstart', start);
    elt.addEventListener('dragend', end);
    elt.className = "drag";
}

function makeDroppable(elt, drop, over, enter, leave) {
    elt.addEventListener('dragover',
			 compose(over ? over : nullfunc, cancel));
    elt.addEventListener('dragenter',
			compose(enter ? enter : nullfunc, cancel));
    elt.addEventListener('dragleave',
			compose(leave ? leave : nullfunc, cancel));
    elt.addEventListener('drop',
			 compose(drop ? drop : nullfunc, cancel));
}

function makeReorderable(elt) {

    function enter (e) {
	var sourceid = curElem.id;

	if (!toInsert) {
	    switch (curElem.dropEffect) {
	    case 'copy':
		toInsert = makeElement(sourceid);
		break;
	    case 'move':
		toInsert =  curElem;
		break;
	    default:
		toInsert = makeElement(sourceid);
		break;
	    };
	}
    }

    function reorder (e) {
	var nearest = nearestChild(this, e.clientX, e.clientY);
	this.insertBefore(toInsert, nearest);
    }

    function drop (e) {
	reorder.call(this, e);
	toInsert = null;
    }

    makeDroppable(elt, drop, reorder, enter);
}

function nearestChild(elt, x, y) {
    var node;
    var min_dist = Number.POSITIVE_INFINITY;
    var nearest = null;
    var dist;

    for (node = elt.firstChild; node; node = node.nextSibling) {
	dist = distToElem(node, x, y);
	if (dist < min_dist) {
	    min_dist = dist;
	    nearest = node;
	}
    }

    if (nearest &&
	nearest == elt.lastChild &&
	distToElem(elt.lastChild, x, y) > 30) {
	return null;
    }

    return nearest;
}

ret.makeDraggable = makeDraggable;
ret.makeDroppable = makeDroppable;
ret.makeReorderable = makeReorderable;
return ret;
})();
/**
 * Loops through a collection, calling the callback function for each element.
 *
 * Can loop through:
 *  - Arrays: callback(item, index, array)
 *  - NodeLists: callback(node, index, nodeList)
 *  - FileLists: callback(file, index, fileList)
 *  - Objects: callback(value, key, object)
 *  - Nodes: callback(elementChild, index, node)
 *    > This will loop through all the _direct_ element child nodes
 *
 * @param mixed collection The collection to loop through
 * @param Function callback The callback function : function(element, indexOrKey, collection)
 */
function forEach(collection, callback) {
    var index, child;

    if (collection instanceof Array) {
        collection.forEach(callback);
    } else if ('length' in collection) {
        for (index = 0; index < collection.length; index++) {
            if (callback(collection[index], index, collection) === false) {
                break;
            }
        }
    } else if (collection instanceof Element) {
        index = 0;
        for (child = collection.firstChild; child; child = child.nextSibling) {
            if (child.nodeType == Node.ELEMENT_NODE) {
                if (callback(child, index, collection) === false) {
                    break;
                }
                index++;
            }
        }
    } else {
        for (index in collection) {
            if (callback(collection[index], index, collection) === false) {
                break;
            }
        }
    }
}

Array.prototype.intersect = function(other) {
    return this.filter(function (element) {
        return other.indexOf(element) > -1;
    });
};
Array.prototype.diff = function(other) {
    return this.filter(function (element) {
        return other.indexOf(element) == -1;
    });
};

function extend(base, members) {
    var k, f;
    f = function () { this.init.apply(this, Array.prototype.slice.call(arguments)); };
    if (base != Object) {
        f.prototype = Object.create(base.prototype);
    }
    for (k in members) {
        f.prototype[k] = members[k];
    }
    if (!('init' in f.prototype)) {
        f.prototype.init = function () {};
    }
    return f;
}

function collapse(element, toHeight) {
    toHeight = toHeight || 0;
    if (!element._transitions) {
        element._transitions = new Transitions(element);
        element._heightDelay = element._transitions.getTime('height');
    }

    delay = element._transitions.getTime('height');

    element._transitions.set('height');
    element.style.height = element.offsetHeight + 'px';
    setTimeout(function () {
        element._transitions.set('height', element._heightDelay);
        element.style.height = toHeight + 'px';
    }, 10);
}

function expand(element) {
    if (!element._transitions) {
        element._transitions = new Transitions(element);
        element._heightDelay = element._transitions.getTime('height');
    }

    element.style.height = element.scrollHeight + 'px';
    setTimeout(function () {
        element._transitions.set('height');
        element.style.height = 'auto';
        element._transitions.set('height', element._heightDelay);
    }, Math.round(element._heightDelay * 1000));
}

var UtilEventDispatcher = extend(Object, {
    on: function(event, listener) {
        if (!('listeners' in this)) {
            this.listeners = {};
        }
        if (!(event in this.listeners)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    },
    off: function(event, listener) {
        if (('listeners' in this) && (event in this.listeners)) {
            for (i = 0; i < this.listeners[event].length; i++) {
                if (this.listeners[event][i] == listener) {
                    this.listeners[event].splice(i, 1);
                    break;
                }
            }
        }
        this.listeners[event].push(listener);
    },
    dispatch: function(event) {
        var args, i, result, r;

        if (('listeners' in this) && (event in this.listeners) && this.listeners[event].length > 0) {
            args = Array.prototype.slice.call(arguments, 1);
            for (i = 0; i < this.listeners[event].length; i++) {
                r = this.listeners[event][i].apply(this, args);
                if (typeof r != 'undefined') {
                    result = r;
                }
            }
        }

        return result;
    }
});

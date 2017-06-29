(function(){

    var events = {
        Event: [
            'abort', 'afterprint', 'audioprocess', 'beforeprint', 'beforeunload', 'broadcast', 'cached', 'canplay', 'canplaythrough', 'change', 'checking', 'close', 'complete', 'downloading', 'durationchange', 'emptied', 'ended', 'error', 'fullscreenchange', 'fullscreenerror', 'haschange', 'input', 'load', 'loadeddata', 'loadedmetadata', 'message', 'noupdate', 'obsolete', 'online', 'offline', 'open', 'pause', 'play', 'playing', 'ratechange', 'readystatechange', 'reset', 'resize', 'scroll', 'seeking', 'seeked', 'stalled', 'submit', 'suspend', 'timeupdate', 'unload', 'updateready', 'volumechange', 'waiting'
        ],
        FocusEvent: [
            'blur', 'focus'
        ],
        PageTransitionEvent: [
            'pagehide', 'pageshow'
        ],
        PopStateEvent: [
            'popstate'
        ],
        AnimationEvent: [
            'animationend', 'animationiteration', 'animationstart'
        ],
        TransitionEvents: [
            'transitioncancel', 'transitionend', 'transitionrun', 'transitionstart'
        ],
        TouchEvent: [
            'compositionend', 'compositionstart', 'compositionupdate', 'touchcancel', 'touchend', 'touchenter', 'touchleave', 'touchmove', 'touchstart'
        ],
        ClipboardEvent: [
            'copy', 'cut', 'paste'
        ],
        KeyboardEvent: [
            'keydown', 'keypress', 'keyup'
        ],
        MouseEvent: [
            'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mousemove', 'mouseover', 'mouseup', 'mouseleave', 'mouseout', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel'
        ],
        DragEvent: [
            'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart', 'drop'
        ],
        ProgressEvent: [
            'loadend', 'loadstart', 'progress', 'timeout'
        ]
    }

    // Polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
            };
    }

    function fireEvent(elem, className, event) {
        var event, initName;

        if ('createEvent' in document) {
            event = document.createEvent(className);
            initName = 'init' + className;
            event[initName](event, true, true, window, null, 0, 0, 0, 0, false, false, false, false, 0, null);
            console.log('createEvent');
        } else {
            event = new window[className]('click');
        }

        document.querySelector('input[type="file"]').dispatchEvent(event);
    }

    function Underscore(elems) {
        this.elems = elems;
    };
    Underscore.prototype.closest = function(selector) {
        var elems = [];

        this.each(function (elem) {
            while (elem && !elem.matches(selector)) {
                elem = elem.parentElement;
            }
            if (elem) {
                elems.push(elem);
            }
        });

        return new Underscore(elems);
    };
    Underscore.prototype.delegate = function(event, selector, handler) {
        this.each(function (elem) {
            elem.addEventListener(event, function (e) {
                var el = e.target;

                while (el) {
                    if (el.matches(selector)) {
                        handler.call(el, e);
                        break;
                    }
                    el = el.parentElement;
                }
            }, true);
        });

        return this;
    };
    Underscore.prototype.on = function(event, selector, handler) {
        if (handler && (typeof selector == 'string')) {
            this.delegate(event, selector, handler);
        } else {
            this.each(function (elem) {
                elem.addEventListener(event, selector);
            });
        }

        return this;
    };
    Underscore.prototype.trigger = function (event, detail, options) {
        var key, interface;

        interface = 'CustomEvent';
        for (key in events) {
            if (events[key].indexOf(event) > -1) {
                interface = key;
                break;
            }
        }

        options = options || {};
        if (!('bubbles' in options)) options.bubbles = true;
        if (detail) options.detail = detail;

        this.each(function (elem) {
            elem.dispatchEvent(new window[interface](event, options));
        });
    };
    Underscore.prototype.addClass = function (className) {
        this.each(function (elem) {
            elem.classList.add(className);
        });

        return this;
    };
    Underscore.prototype.removeClass = function (className) {
        this.each(function (elem) {
            elem.classList.remove(className);
        });

        return this;
    };
    Underscore.prototype.hasClass = function (className) {
        var hasClass = false;
        this.each(function (elem) {
            hasClass = hasClass || elem.classList.contains(className);
        });

        return this;
    };
    Underscore.prototype.toggleClass = function (className, state) {
        var hasClass = false;
        this.each(function (elem) {
            if (state === true) elem.classList.add(className);
            else if (state === false) elem.classList.remove(className);
            else elem.classList.toggle(className);
        });

        return this;
    };
    Underscore.prototype.show = function () {
        this.each(function (elem) {
            elem.style.display = 'block';
        });

        return this;
    };
    Underscore.prototype.hide = function () {
        this.each(function (elem) {
            elem.style.display = 'none';
        });

        return this;
    };
    Underscore.prototype.toggle = function (state) {
        this.each(function (elem) {
            if (typeof state == 'undefined') {
                state = getComputedStyle(elem).display == 'none';
            }
            elem.style.display = state ? 'block' : 'none';
        });

        return this;
    };
    Underscore.prototype.each = function (callback) {
        var i;

        for (i = 0; i < this.elems.length; i++) {
            callback.call(this.elems[i], this.elems[i], i, this.elems);
        }

        return this;
    };
    Underscore.prototype.html = function (html) {
        this.each(function (elem, index) {
            if (html instanceof Function) {
                this.innerHTML = html(this.innerHTML, index);
            } else {
                this.innerHTML = html;
            }
        });

        return this;
    };
    Underscore.prototype.val = function (value) {
        var elem;

        if (typeof value == 'undefined') {
            if (this.elems.length > 0) {
                elem = this.elems[0];
                value = elem.tagName.toLowerCase() == 'select'
                    ? (elem.selectedIndex > -1 ? elem.options[elem.selectedIndex] : null)
                    : elem.value;
            } else {
                value = null;
            }

            return value;
        } else {
            this.each(function (elem, index) {
                var val, idx;

                if (elem.tagName.toLowerCase() == 'select') {
                    if (value instanceof Function) {
                        val = value(elem.selectedIndex > -1 ? elem.options[elem.selectedIndex] : null, index);
                    } else {
                        val = value;
                    }
                    idx = elem.options.length;
                    while (idx--) {
                        if (elem.options[i].value == val) break;
                    }
                    elem.selectedIndex = val;
                } else {
                    if (value instanceof Function) {
                        this.value =  value(this.value, index);
                    } else {
                        this.value = index;
                    }
                }
            });

            return this;
        }
    };
    Underscore.prototype.offset = function () {
        var el, offset = { top: 0, left: 0 };

        if (this.length > 0) {
            el = this.elems[0];
            while (el && el.offsetParent) {
                offset.top += el.offsetTop;
                offset.left += el.offsetLeft;
                el = el.offsetParent;
            }
        }

        return offset;
    };
    Underscore.prototype.data = function (key, value) {
        var data, i, attr;

        if (key) {
            key = 'data-' + key.replace(/[A-Z]/g, '-$&').toLowerCase();
            if (value) {
                this.each(function (elem) {
                    this.setAttribute(key, value);
                });
                return this;
            } else {
                this.each(function (elem) {
                    if (!value) value = this.getAttribute(key);
                });
                return value;
            }
        } else {
            data = {};
            if (this.elems.length > 0) {
                for (i = 0; i < this.elems[0].attributes.length; i++) {
                    attr = this.elems[0].attributes[i];
                    if (attr.name.substr(0, 5) == 'data-') {
                        key = attr.name.substr(5).replace(/-([a-zA-Z0-9])/g, function (p, m1) { return m1.toUpperCase(); });
                        data[key] = attr.value;
                    }
                }
            }
            return data;
        }
    };
    Underscore.prototype.children = function (selector) {
        var elems = [];

        this.each(function (elem) {
            var child;
            for (child = elem.firstElementChild; child; child = child.nextElementSibling) {
                if (!selector || child.matches(selector)) {
                    elems.push(child);
                }
            }
        });

        return new Underscore(elems);
    };
    Underscore.prototype.siblings = function () {
        var elems = [];

        this.each(function (elem) {
            var sibling;
            for (sibling = elem.parentElement.firstElementChild; sibling; sibling = sibling.nextElementSibling) {
                if (sibling != elem) {
                    elems.push(sibling);
                }
            }
        });

        return new Underscore(elems);
    };
    Underscore.prototype.remove = function () {
        this.each(function (elem) {
            elem.parentElement.removeChild(elem);
        });
    };
    Object.defineProperty(Underscore.prototype, 'length', { get: function() { return this.elems.length; } });

    Underscore.registerPlugin = function (name, definition, defaultOptions) {
        Underscore.prototype[name] = function () {
            var options, command, args;

            function init(elem) {
                var propName, myOptions;

                propName = '_' + name + 'Plugin';
                if (!(propName in elem)) {
                    myOptions = Object.create(defaultOptions||{});
                    for (key in options) {
                        myOptions[key] = options[key];
                    }
                    if (!(elem[propName] = definition(elem, myOptions))) {
                        elem[propName] = true;
                    }
                }

                return elem[propName];
            }

            if (arguments.length > 0) {
                if (typeof arguments[0] == 'string') {
                    command = arguments[0].replace(/\s([a-zA-Z0-9])/g, function (p, m1) { return m1.toUpperCase(); });
                    args = Array.prototype.slice.call(arguments, 1);
                } else if (typeof arguments[0] == 'object') {
                    options = arguments[0];
                }
            }

            this.each(function (elem) {
                var plugin = init(elem);

                if (command) {
                    if (!(command in plugin)) {
                        console.error('No such method: \'' + command + '\' in plugin \'' + name + '\'');
                    } else {
                        plugin[command].apply(plugin, args);
                    }
                }
            });

            return this;
        }
    };

    window._ = function _(el, context) {
        var us;

        context = context || document;

        if (typeof el == 'string') {
            us = new Underscore(context.querySelectorAll(el));
        } else if (el instanceof Element) {
            us = new Underscore([ el ]);
        } else if (el instanceof Underscore) {
            us = el;
        } else {
            us = new Underscore(el)
        }

        return us;
    }

    window._.registerPlugin = Underscore.registerPlugin;

    window._.ajax = function (options) {
        var xhr, key;

        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            var response;

            if (this.readyState == 4) {
                if (this.status == 200) {
                    if ('success' in options) {
                        response = this.response;
                        if (typeof response == 'string' && (response[0] == '[' || response[0] == '{' || ('dataType' in options && options.dataType == 'json'))) {
                            response = JSON.parse(response);
                        }
                        options.success.call(this, response);
                    }
                } else {
                    if ('error' in options) {
                        options.error.call(this, this, this.statusText, this.status);
                    }
                }
                if ('complete' in options) {
                    options.complete.call(this, this, this.statusText);
                }
            }
        };
        xhr.open(options.method||'get', options.url||location.pathname, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if ('headers' in options) {
            for (ley in options.headers) {
                xhr.setRequestHeader(key, options.headers[key]);
            }
        }
        xhr.send(options.data||null);
    };

})();

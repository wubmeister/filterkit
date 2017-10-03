var FilterKit = {
    EXACT_MATCH: 2,
    resolveElement: function (el, multi) {
        if (!el) {
            return null
        } else if (typeof el == 'string') {
            return multi ? document.querySelectorAll(el) : document.querySelector(el);
        } else if (!(el instanceof Element)) { // Probably jQuery
            return !multi && el.length ? el[0] : el;
        }

        return multi ? [ el ] : el;
    },
    resolveOptions: function (options, defaults, element) {
        var key, fixedKey, value, attr, result;

        options = options || {};
        defaults = defaults || {};

        result = Object.create(options);

        if (element) {
            for (key in element.attributes) {
                attr = element.attributes[key];
                if (attr.name && attr.name.substr(0, 5) == 'data-') {
                    key = attr.name.substr(5).replace(/-([a-z0-9])/g, function (p, m1) { return m1.toUpperCase(); });
                    if (key in defaults) {
                        value = attr.value;
                        if (value == 'true' || value == 'false') {
                            value = value == 'true';
                        }
                        result[key] = value;
                    }
                }
            }
        }

        for (key in defaults) {
            if (!(key in result)) {
                result[key] = defaults[key];
            } else if (typeof result[key] == 'object' && typeof defaults[key] == 'object') {
                result[key] = this.resolveOptions(result[key], defaults[key]);
            }
        }

        return result;
    },
    createElement: function (spec, attrs, style) {
        var m, m2, i, tagName = 'div', el, key;

        if (m = spec.match(/^([a-zA-Z][a-zA-Z\-_:]*)/)) {
            tagName = m[1];
        }

        el = document.createElement(tagName);

        m = spec.match(/#([a-zA-Z][a-zA-Z0-9\-_:]*)/);
        if (m) {
            el.id = m[1];
        }

        m = spec.match(/(\.[a-zA-Z][a-zA-Z0-9\-_:.]*)+/);
        if (m) {
            el.className = m[0].substr(1).replace(/\./g, ' ');
        }

        m = spec.match(/\[[^=]+="[^"]*"\]/g);
        if (m) {
            for (i = 0; i < m.length; i++) {
                m2 = m[i].match(/\[([^=]+)="([^"]*)"\]/);
                el.setAttribute(m2[1], m2[2]);
            }
        }

        if (attrs) {
            for (i in attrs) {
                key = i.replace(/[A-Z]/g, '-$&').toLowerCase();
                el.setAttribute(key, attrs[i]);
            }
        }

        if (style) {
            for (i in style) {
                el.style[i] = style[i];
            }
        }

        return el;
    },
    getUid: function (prefix) {
        var result;

        if (!this._uid) {
            this._uid = 0;
        }
        result = (prefix || '') + this._uid;
        this._uid++;
        return result;
    },
    Conditions: {},
    SelectOutput: {},
    Controls: {},
    Collections: {},
    CollectionViews: {},
    Util: {}
};

window.addEventListener('click', function (e) {
    if (_(e.target).closest('.chip').length == 0) {
        _('.preselect.chip').removeClass('preselect');
    }
});

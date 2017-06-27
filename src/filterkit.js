var FilterKit = {
    resolveElement: function (el, multi) {
        if (typeof el == 'string') {
            return multi ? document.querySelectorAll(el) : document.querySelector(el);
        } else if (!(el instanceof Element)) { // Probably jQuery
            return !multi && el.length ? el[0] : el;
        }

        return multi ? [ el ] : el;
    },
    resolveOptions: function (options, defaults) {
        var key;

        options = options || {};
        defaults = defaults || {};

        for (key in defaults) {
            if (!(key in options)) {
                options[key] = defaults[key];
            }
        }

        return options;
    },
    createElement: function (spec, attrs, style) {
        var m, m2, i, tagName = 'div', el;

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
                el.setAttribute(i, attrs[i]);
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

function templatify(template, open, close) {
    var lastIndex,
        index,
        nextIndex,
        js;

    function htmlSpecialChars(str) {
        return str
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&/g, '&amp;');
    }

    js = '';
    lastIndex = 0;

    open = open || '<%';
    close = close || '%>';

    while (lastIndex < template.length && (index = template.indexOf('<%', lastIndex)) > -1) {
        if (index > lastIndex) {
            js += (js == '' ? 't=' : 't+=') + JSON.stringify(template.substring(lastIndex, index)) + ';';
        }

        nextIndex = template.indexOf(close, index + open.length);

        if (nextIndex == -1) {
            nextIndex = template.length;
        }
        tpl = template.substring(index + open.length, nextIndex);
        lastIndex = nextIndex + close.length;

        tpl = tpl.replace(/isset\(([a-zA-Z\$_][a-zA-Z\$_]*)\)/g, function (p, m1) {
            return "('" + m1 + "' in o)";
        });

        if (tpl[0] == '=' || tpl[0] == '-') {
            js += (js == '' ? 't=(' : 't+=(') + (tpl[0] == '-' ? htmlSpecialChars(tpl.substr(1)) : tpl.substr(1)) + ');';
        } else {
            js += tpl;
        }
    }

    if (lastIndex < template.length) {
        js += (js == '' ? ' t=' : 't+=') + JSON.stringify(template.substr(lastIndex)) + ';';
    }

    js = 'with(o){var t;' + js + ';return t;}';

    return new Function('o', js);
}

function capitalize(text) {
    return text.replace(/\b[a-zA-Z]/g, function (p) { return p.toUpperCase(); });
}
function count_paragraphs(text) {
    var m = text.replace(/^\s+|\s+$/g, '').match(/\n\n/g);
    return m ? m.length + 1 : 1;
}
function count_sentences(text) {
    var m = text.match(/\./g),
        num = m ? m.length : 0;
    if (text.replace(/\s+$/, '').substr(-1) != '.') num++;
    return num;
}
function count_words(text) {
    var m = text.match(/\b[a-zA-Z]+\b/g);
    return m.length;
}
function nl2br(text) {
    return text ? text.replace(/\n/g, '<br/>') : '';
}
function strip(text) {
    return text.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}
function strip_tags(text) {
    return text.replace(/<[^>]+>/g, '');
}
function truncate(text, limit) {
    limit = limit || 120;
    if (text.length > limit) {
        text = text.substr(0, limit - 3) + '...';
    }
    return text;
}

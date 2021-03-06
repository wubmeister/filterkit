FilterKit.Value = extend(Object, {
    init: function(name, filters) {
        this.conditions = {};
        this.name = name;
        this.filters = filters;
    },
    addCondition: function (operand, value, replace, cancelTags) {
        if (operand in this.conditions) {
            if (replace) {
                this.conditions[operand].replaceValue(value, cancelTags);
            } else {
                this.conditions[operand].addValue(value, cancelTags);
            }
        } else {
            cls = operand ? operand[0].toUpperCase() + operand.substr(1) : 'Eq';
            this.conditions[operand] = new FilterKit.Conditions[cls](value, this, cancelTags);
        }
    },
    removeCondition: function (operand, value) {
        if (operand in this.conditions) {
            this.conditions[operand].removeValue(value);
            if (!this.conditions[operand].hasValues()) {
                delete this.conditions[operand];
            }
        }
    },
    checkValue: function (value) {
        var operand, match = true;

        for (operand in this.conditions) {
            match = this.conditions[operand].checkValue(value);
            if (!match || match === FilterKit.EXACT_MATCH) {
                break;
            }
        }

        return match;
    },
    serializeQuery: function () {
        var key, queryParts = [], part;

        for (key in this.conditions) {
            part = this.conditions[key].serializeQuery(this.name);
            if (part && part != '' && part != '&') {
                queryParts.push(part);
            }
        }

        return queryParts.join('&');
    },
    addTag: function (value, operand) {
        this.filters.addTag(this.name, value, operand);
    },
    replaceTag: function (value, operand) {
        this.filters.replaceTag(this.name, value, operand);
    },
    removeTag: function (value, operand) {
        this.filters.removeTag(this.name, value, operand);
    }
});

FilterKit.Filters = extend(UtilEventDispatcher, {
    init: function () {
        this.filters = {};
        this.filterTags = {};
        this.keyLabels = {};
        this.valueLabels = {};
        this.isBatching = false;
        this.filterCount = 0;
        this.eventsCancelled = false;
        this.filterOptions = {};
    },
    getHash: function (key, value) {
        return key + '_' + value;
    },
    checkItem: function (item) {
        var key, match = true, property;

        for (key in this.filters) {
            if (key in item) {
                match = this.filters[key].checkValue(item[key]);

                if (match === FilterKit.EXACT_MATCH) {
                    this.dispatch('exactMatch', item);
                }

                if (!match) {
                    break;
                }
            }
        }

        return match;
    },
    addValue: function (name, value, operand, replace, cancelTags) {
        var tag, key;

        operand = operand || 'eq';

        if (!(name in this.filters)) {
            this.clearValue(name);
            this.filters[name] = new FilterKit.Value(name, this);
        }
        this.filters[name].addCondition(operand, value, replace, cancelTags);

        if (!this.isBatching) {
            if (!this.eventsCancelled) {
                this.dispatch('change');
            }
        } else {
            this.batchChanges++;
        }
    },
    removeValue: function (name, value, operand) {
        var hash;

        operand = operand || 'eq';

        if (name in this.filters) {
            this.filters[name].removeCondition(operand, value);
            this.filterCount--;
            hash = this.getHash(name, value);
            if (!this.eventsCancelled && (hash in this.filterTags[name])) {
                this.dispatch('removetag', this.filterTags[name][hash]);
            }
        }

        if (!this.isBatching) {
            if (!this.eventsCancelled) {
                this.dispatch('change');
            }
        } else {
            this.batchChanges++;
        }
    },
    clearValue: function (name) {
        var hash;

        if (name in this.filterTags) {
            if (!this.eventsCancelled) {
                for (hash in this.filterTags[name]) {
                    this.dispatch('removetag', this.filterTags[name][hash]);
                }
            }
            delete this.filterTags[name];
        }
        if (name in this.filters) {
            delete this.filters[name];
        }
    },
    clearAll: function () {
        var name;

        for (name in this.filters) {
            this.clearValue(name);
        }

        this.filterCount = 0;

        if (!this.isBatching) {
            if (!this.eventsCancelled) {
                this.dispatch('change');
            }
        } else {
            this.batchChanges++;
        }
    },
    createTag: function (name, value, operand) {
        tag = {
            key: name,
            value: value,
            keyLabel: name,
            valueLabel: value,
            operand: operand,
            hash: this.getHash(name, value)
        };
        if (name in this.keyLabels) {
            tag.keyLabel = this.keyLabels[name];
        }
        if (tag.hash in this.valueLabels) {
            tag.valueLabel = this.valueLabels[tag.hash];
        }
        if (operand == 'geo' && this.filters[name].conditions.geo.searchString) {
            tag.valueLabel = this.filters[name].conditions.geo.searchString;
        }

        return tag;
    },
    addTag: function (name, value, operand) {
        var tag = this.createTag(name, value, operand);

        if (!(name in this.filterTags)) {
            this.filterTags[name] = {};
        }

        this.filterCount++;

        this.filterTags[name][tag.hash] = tag;
        if (!this.eventsCancelled) {
            this.dispatch('addtag', tag);
        }
    },
    replaceTag: function (name, value, operand) {
        var that = this,
            tag = this.createTag(name, value, operand);

        if ((name in this.filterTags) && !this.eventsCancelled) {
            forEach(this.filterTags, function (tag) {
                that.dispatch('removetag', tag);
            });
        }

        this.filterTags[name] = {};
        this.filterTags[name][tag.hash] = tag;

        if (!this.eventsCancelled) {
            this.dispatch('addtag', tag);
        }
    },
    removeTag: function (name, value) {
        var hash = this.getHash(name, value);

        this.filterCount--;

        if ((name in this.filterTags) && (hash in this.filterTags[name])) {
            if (!this.eventsCancelled) {
                this.dispatch('removetag', this.filterTags[name][hash]);
            }
            delete this.filterTags[name][hash];
        }
    },
    serializeQuery: function (clearKey) {
        var key, queryParts = [], result, part;

        for (key in this.filters) {
            part = this.filters[key].serializeQuery();
            if (part && part != '' && part != '&') {
                queryParts.push(part);
            }
        }

        result = queryParts.join('&');

        if (result == '' && clearKey) {
            return clearKey + '=';
        }

        return result;
    },
    startBatch: function () {
        this.batchChanges = 0;
        this.isBatching = true;
    },
    endBatch: function () {
        if (!this.eventsCancelled && this.isBatching && this.batchChanges > 0) {
            this.dispatch('change');
        }
        this.isBatching = false;
    },
    unserializeQuery: function (query) {
        var i, key, operand, value, queryParts, m;

        this.startBatch();

        this.clearAll();

        queryParts = query.replace(/^\?/, '').split('&');
        for (i = 0; i < queryParts.length; i++) {
            if (m = queryParts[i].match(/^([^\[=]+)(\[[^\]]*\])?=([^$]*)/)) {
                key = m[1];
                operand = m[2] ? m[2].replace(/^\[|\]$/g, '') : 'eq';
                value = decodeURIComponent(m[3]);
                this.addValue(key, value, operand, operand == 'geo');
            }
        }

        this.endBatch();
    },
    setKeyLabel: function (key, label) {
        this.keyLabels[key] = label;
    },
    setValueLabel: function (key, value, label) {

        this.valueLabels[this.getHash(key, value)] = label;
    },
    setLabels: function (labels) {
        var key, i;

        for (key in labels) {
            if (key != 'introtext' && key != 'fulltext') {
                if ('label' in labels[key]) {
                    this.setKeyLabel(key, labels[key].label);
                }

                if ('options' in labels[key]) {
                    for (i in labels[key].options) {
                        if ('label' in labels[key].options[i]) {
                            this.setValueLabel(key, labels[key].options[i].value, labels[key].options[i].label);
                        }
                    }
                }
            }
        }
    },
    cancelEvents: function (cancel) {
        this.eventsCancelled = (typeof cancel == 'undefined') ? true : cancel;
    },
    setOptions: function (options) {
        var key;

        for (key in options) {
            this.filterOptions[key] = options[key];
            this.dispatch('options:' + key, options[key]);
        }

        this.dispatch('options', this.filterOptions);
    }
});

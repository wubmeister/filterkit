FilterKit.Value = extend(Object, {
    init: function() {
        this.conditions = {};
    },
    addCondition: function (operand, value) {
        if (operand in this.conditions) {
            this.conditions[operand].addValue(value);
        } else {
            cls = operand ? operand[0].toUpperCase() + operand.substr(1) : 'Eq';
            this.conditions[operand] = new FilterKit.Conditions[cls](value);
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
    serializeQuery: function (name) {
        var key, queryParts = [], part;

        for (key in this.conditions) {
            part = this.conditions[key].serializeQuery(name);
            if (part && part != '') {
                queryParts.push(part);
            }
        }

        return queryParts.join('&');
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
    addValue: function (name, value, operand, replace) {
        var tag, key, origFilterCount, isNew = !(name in this.filters);

        operand = operand || 'eq';
        origFilterCount = this.filterCount;

        if (!(name in this.filters) || replace) {
            this.clearValue(name);
            this.filters[name] = new FilterKit.Value();
            this.filterTags[name] = {};
        }
        this.filters[name].addCondition(operand, value);

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
        this.filterTags[name][tag.hash] = tag;

        if ((!replace || isNew) && value && value != '') this.filterCount++;
        else if (replace && !isNew && (!value || value == '')) this.filterCount--;

        // if (this.filterCount != origFilterCount) {
            if (!this.eventsCancelled) {
                this.dispatch('addtag', tag);
            }

            if (!this.isBatching) {
                if (!this.eventsCancelled) {
                    this.dispatch('change');
                }
            } else {
                this.batchChanges++;
            }
        // }
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
    serializeQuery: function (clearKey) {
        var key, queryParts = [], result;

        for (key in this.filters) {
            queryParts.push(this.filters[key].serializeQuery(key));
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
    }
});

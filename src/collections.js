FilterKit.Collections.Base = extend(UtilEventDispatcher, {
    setFilters: function (filters) {
        this.filters = filters;
        filters.on('change', this.update.bind(this));
    },
    update: function () {
        var i;
        for (i = 0; i < this.items.length; i++) {
            this.items[i].isFiltered = this.filters.checkItem(this.items[i]);
        }
        this.dispatch('update', this.items);
    },
    getPreviousFilteredItem: function (fromIndex, wrap, returnIndex, skipSelected) {
        var index;

        index = fromIndex = (fromIndex == -1 ? 0 : fromIndex);

        do {
            index--;
            if (index <= 0) {
                if (wrap) {
                    index = index + this.items.length - 1;
                } else {
                    index = 0;
                    break;
                }
            }
            // if (skipSelected && this.items[index].isFiltered && this.items[index].isSelected) {
            //     index--;
            // }
        } while (index != fromIndex && (!this.items[index].isFiltered || (skipSelected && this.items[index].isSelected)));

        return returnIndex ? index : this.items[index];
    },
    getNextFilteredItem: function (fromIndex, wrap, returnIndex, skipSelected) {
        var index;

        index = fromIndex = (typeof fromIndex == 'undefined') ? -1 : fromIndex;

        do {
            index++;
            if (index > this.items.length) {
                if (wrap) {
                    index = 0;
                } else {
                    index = this.items.length - 1;
                    break;
                }
            }
        } while (index != fromIndex && index < this.items.length && (!this.items[index].isFiltered || (skipSelected && this.items[index].isSelected)));

        return returnIndex ? index : this.items[index];
    },
    selectItem: function (value, replace) {
        var i, found;

        if (!('selectedValues' in this)) {
            this.selectedValues = [];
            this.preSelectedValues = [];
        }

        if (typeof value == 'object') {
                if (replace) {
                    for (i = 0; i < this.items.length; i++) {
                        this.items[i].isSelected = false;
                    }
                }
                value.isSelected = true;
                this.selectedValues.push(value.value);
                this.dispatch('selectItem', value, replace);
            // } if (this.items.indexOf(value) > -1) {
            //     this.preSelectedValues.push(value.value);
            // }
        } else {
            for (i = 0; i < this.items.length; i++) {
                if (this.items[i].value == value) {
                    this.items[i].isSelected = true;
                    this.selectedValues.push(this.items[i].value);
                    found = true;
                    this.dispatch('selectItem', this.items[i], replace);
                } else if (replace) {
                    this.items[i].isSelected = false;
                }
            }
            if (!found) {
                this.preSelectedValues.push(/^\d+$/.test(value) ? parseInt(value) : value);
            }
        }
    },
    unselectItem: function (value) {
        var i, index;

        if (!('selectedValues' in this)) {
            this.selectedValues = [];
        }

        if (typeof value == 'object') {
            if (this.items.indexOf(value) > -1) {
                if (this.dispatch('beforeUnselectItem', value) !== false) {
                    value.isSelected = false;
                    if ((index = this.selectedValues.indexOf(value.value)) > -1) {
                        this.selectedValues.splice(index, 1);
                    }
                    this.dispatch('unselectItem', value);
                }
            }
        } else {
            for (i = 0; i < this.items.length; i++) {
                if (this.items[i].value == value) {
                    if (this.dispatch('beforeUnselectItem', this.items[i]) !== false) {
                        this.items[i].isSelected = false;
                        if ((index = this.selectedValues.indexOf(this.items[i].value)) > -1) {
                            this.selectedValues.splice(index, 1);
                        }
                        this.dispatch('unselectItem', this.items[i]);
                    }
                }
            }
        }
    },
    addItem: function (item) {
        if (this.items && this.items instanceof Array) {
            item.isFiltered = true;
            item.isSelected = false;
            this.items.unshift(item);
            this.dispatch('update', this.items);
        }
    },
    collectItems: function () {
        var elements, callback, that, uid;

        function elementToItem(el) {
            var item, index, attr, key;

            if (el.hasAttribute('data-item')) {
                item = JSON.parse(atob(el.getAttribute('data-item')));
            } else {
                item = { value: el.getAttribute('data-value') || uid+'', label: el.textContent.replace(/^\s+|\s+$/g, '') };
                for (index = 0; index < el.attributes.length; index++) {
                    attr = el.attributes[index];
                    if (attr.name.substr(0, 5) == 'data-' && attr.name != 'data-value') {
                        key = attr.name.substr(5).replace(/-([a-zA-Z])/g, function (p, m1) { return m1.toUpperCase(); });
                        item[key] = attr.value;
                    }
                }
            }
            if (item.value == uid) {
                uid++;
                el.setAttribute('data-value', item.value);
            }
            return item;
        }

        uid = 0;

        elements = this.container.querySelectorAll(this.options.itemSelector);
        that = this;
        callback = ('elementToItem' in this.options) && this.options.elementToItem ? this.options.elementToItem : elementToItem;

        this.items = [];

        forEach(elements, function (el) {
            var item;

            if (!el.parentElement.classList.contains('itemtemplate')) {
                item = callback(el);
                item.element = el;
                item.isFiltered = true;
                that.items.push(item);
            }
        });
    }
});
FilterKit.Collections.DOM = extend(FilterKit.Collections.Base, {
    init: function (el, filters, options) {
        this.items = [];
        this.container = FilterKit.resolveElement(el);
        this.options = FilterKit.resolveOptions(options, {
            itemSelector: '.item'
        }, this.container);
        this.collectItems();
        this.setFilters(filters);
    }
});
FilterKit.Collections.Array = extend(FilterKit.Collections.Base, {
    init: function (items, filters) {
        this.items = items;
        forEach(this.items, function (item) {
            item.isFiltered = true;
        });
        this.setFilters(filters);
    }
});
FilterKit.Collections.AjaxJSON = extend(FilterKit.Collections.Base, {
    init: function (filters, options) {
        this.items = [];
        this.options = FilterKit.resolveOptions(options, {
            baseUrl: location.pathname,
            initialCollect: true,
            clearKey: null,
            htmlKey: 'html',
            initialDomCollection: null,
            itemSelector: '.item'
        });
        if (options.initialDomCollection) {
            this.container = FilterKit.resolveElement(options.initialDomCollection);
            this.collectItems();
        }
        this.setFilters(filters);
        if (options.initialCollect) {
            this.fetchItems(this.options.baseUrl);
        }
    },
    parseResponse: function (responseText) {
        this.parseResponseJSON(responseText);
    },
    parseResponseJSON: function (responseText) {
        var selectedValues, preSelectedValues, that;

        that = this;
        selectedValues = this.selectedValues || [];
        preSelectedValues = this.preSelectedValues || [];

        result = (typeof responseText == 'object') ? responseText : JSON.parse(responseText);
        this.items = (result instanceof Array) ? result : result.items;
        this.pages = (result instanceof Array) ? null : result.pages;
        forEach(this.items, function (item) {
            var index;

            item.isFiltered = true;
            item.isSelected = (selectedValues.indexOf(item.value) > -1);

            if ((index = preSelectedValues.indexOf(item.value)) > -1) {
                preSelectedValues.splice(index, 1);
                that.selectItem(item);
            }
        });

        this.dispatch('update', this.items, this.pages);

        forEach(this.items, function (item) {
            if (item.isExactMatch) {
                that.filters.dispatch('exactMatch', item);
            }
        });
    },
    fetchItems: function (url) {
        var xhr, that;

        if (!this.isFetching) {
            this.isFetching = true;

            that = this;
            xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                var result, url;

                if (this.readyState == 4) {
                    if (this.status == 200) {
                        that.parseResponse(this.responseText);
                    } else {
                        console.error('Fetch JSON items - ' + url + ' responded with ' + this.statusText);
                    }
                    that.isFetching = false;

                    if (that.queueUrl) {
                        url = that.queueUrl;
                        that.queueUrl = null;
                        that.fetchItems(url);
                    }
                }
            };
            xhr.open('get', url, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send();
        } else {
            this.queueUrl = url;
        }
    },
    update: function () {
        var query, url;

        query = this.filters.serializeQuery(this.options.clearKey);
        url = this.options.baseUrl + (query ? '?' + query : '');

        this.fetchItems(url);
    }
});
FilterKit.Collections.AjaxHTML = extend(FilterKit.Collections.AjaxJSON, {
    parseResponse: function (responseText) {
        var response;

        if (responseText[0] == '{') {
            response = JSON.parse(responseText);

            if (response && (this.options.htmlKey in response)) {
                this.dispatch('update', response[this.options.htmlKey], response.pages||null);
            } else {
                response = null;
            }
        }

        if (!response) {
            this.dispatch('update', responseText);
        }
    }
});
FilterKit.Collections.AjaxAutoselect = extend(FilterKit.Collections.AjaxJSON, {
    parseResponse: function (responseText) {
        var response;

        if (responseText[0] == '{') {
            response = JSON.parse(responseText);

            if (response) {
                if (this.options.htmlKey && (this.options.htmlKey in response)) {
                    this.dispatch('update', response[this.options.htmlKey], response.pages||null);
                } else {
                    this.parseResponseJSON(response);
                }
            }
        }

        if (!response) {
            this.dispatch('update', responseText);
        }
    }
});

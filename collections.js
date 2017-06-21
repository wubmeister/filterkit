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
    getPreviousFilteredItem: function (fromIndex, wrap, returnIndex) {
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
        } while (index != fromIndex && !this.items[index].isFiltered);

        return returnIndex ? index : this.items[index];
    },
    getNextFilteredItem: function (fromIndex, wrap, returnIndex) {
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
        } while (index != fromIndex && index < this.items.length && !this.items[index].isFiltered);

        return returnIndex ? index : this.items[index];
    },
    selectItem: function (value, replace) {
        var i;

        if (typeof value == 'object') {
            if (this.items.indexOf(value) > -1) {
                if (replace) {
                    for (i = 0; i < this.items.length; i++) {
                        this.items[i].isSelected = false;
                    }
                }
                value.isSelected = true;
                this.dispatch('selectItem', value, replace);
            }
        } else {
            for (i = 0; i < this.items.length; i++) {
                if (this.items[i].value == value) {
                    this.items[i].isSelected = true;
                    this.dispatch('selectItem', this.items[i], replace);
                } else if (replace) {
                    this.items[i].isSelected = false;
                }
            }
        }
    }
});
FilterKit.Collections.DOM = extend(FilterKit.Collections.Base, {
    init: function (el, filters, options) {
        this.container = FilterKit.resolveElement(el);
        this.options = FilterKit.resolveOptions(options, {
            itemSelector: '.item'
        });
        this.collectItems();
        this.setFilters(filters);
    },
    collectItems: function () {
        var elements, callback, that, uid;

        function elementToItem(el) {
            var item = { value: el.getAttribute('data-value') || uid+'', label: el.textContent.replace(/^\s+|\s+$/g, '') };
            if (item.value == uid) {
                uid++;
                el.setAttribute('data-value', item.value);
            }
            return item;
        }

        uid = 0;

        elements = this.container.querySelectorAll(this.options.itemSelector);
        that = this;
        callback = ('elementToItem' in this.options) ? this.options.elementToItem : elementToItem;

        this.items = [];

        forEach(elements, function (el) {
            var item = callback(el);
            item.element = el;
            item.isFiltered = true;
            that.items.push(item);
        });
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
        this.options = FilterKit.resolveOptions(options, {
            baseUrl: location.pathname
        });
        this.setFilters(filters);
    },
    parseResponse: function (responseText) {
        result = JSON.parse(responseText);
        this.items = (result instanceof Array) ? result : result.items;
        forEach(this.items, function (item) {
            item.isFiltered = true;
        });
        this.dispatch('update', this.items);
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
            xhr.send();
        } else {
            this.queueUrl = url;
        }
    },
    update: function () {
        var query, url;

        query = this.filters.serializeQuery();
        url = this.options.baseUrl + (query ? '?' + query : '');

        this.fetchItems(url);
    }
});
FilterKit.Collections.AjaxHTML = extend(FilterKit.Collections.AjaxJSON, {
    parseResponse: function (responseText) {
        that.dispatch('update', responseText);
    }
});

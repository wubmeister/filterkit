FilterKit.CollectionViews.Div = extend(UtilEventDispatcher, {
    init: function (el, collection, options) {
        var templateEl, view;

        view = this;

        this.container = FilterKit.resolveElement(el);
        this.collection = collection;
        this.options = FilterKit.resolveOptions(options, {
            showSelected: 'highlighted',
            maxVisible: 0,
            multiple: false,
            template: null
        }, this.container);

        templateEl = this.container.querySelector('.itemtemplate');
        if (templateEl) {
            this.template = templatify(templateEl.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
            templateEl.parentElement.removeChild(templateEl);
        } else if (this.options.template) {
            this.template = templatify(this.options.template);
        } else {
            this.template = templatify('<div class="item"><%= label %></div>');
        }

        this.noResultsEl = this.container.querySelector('.noresults');
        if (this.noResultsEl) {
            _(this.noResultsEl).remove();
        }

        this.addItemEl = this.container.querySelector('.additem');
        if (this.addItemEl) {
            this.addItemTemplate = this.addItemEl.innerHTML;
            _(this.addItemEl).remove();
        }

        collection.on('update', this.onUpdate.bind(this));
        collection.on('selectItem', this.onSelect.bind(this));
        collection.on('unselectItem', this.onUnselect.bind(this));

        _(this.container).delegate('click', '.item', function (e) {
            e.preventDefault();
            if (this == view.addItemEl) {
                view.dispatch('addItem', view.term);
            } else if (this.hasAttribute('data-value')) {
                collection.selectItem(this.getAttribute('data-value'), !view.options.multiple);
            }
        });
    },
    onUpdate: function (result, pages) {
        var i, html, numVisible, div;

        numVisible = 0;
        if (typeof result == 'string') {
            this.container.innerHTML = result;
        } else if (this.template) {
            this.container.innerHTML = '';
            div = document.createElement('div');

            for (i = 0; i < result.length; i++) {
                html = this.template(result[i]);
                if (/^\s*<tr\b/.test(html) && div.nodeName != 'TABLE') {
                    div = document.createElement('table');
                }

                div.innerHTML = html;
                result[i].element = div.firstElementChild;
                if (result[i].element.nodeName == 'TBODY') {
                    result[i].element = result[i].element.firstElementChild;
                }

                this.container.appendChild(result[i].element);
                result[i].element.setAttribute('data-value', result[i].value);

                if (result[i].isFiltered && (!result[i].isSelected || this.options.showSelected != 'hidden')) {
                    result[i].element.style.display = result[i].element.nodeName == 'TR' ? 'table-row' : 'block';
                    if (++numVisible >= this.options.maxVisible && this.options.maxVisible > 0) {
                        break;
                    }
                } else {
                    result[i].element.style.display = 'none';
                }
            }
        } else {
            for (i = 0; i < result.length; i++) {
                if ('element' in result[i]) {
                    if (result[i].isFiltered && (!result[i].isSelected || this.options.showSelected != 'hidden')) {
                        result[i].element.style.display = result[i].element.nodeName == 'TR' ? 'table-row' : 'block';
                        if (++numVisible >= this.options.maxVisible && this.options.maxVisible > 0) {
                            break;
                        }
                    } else {
                        result[i].element.style.display = 'none';
                    }
                }
            }
        }

        if ((numVisible == 0 || this.innerHTML == '') && this.noResultsEl) {
            this.container.appendChild(this.noResultsEl);
        }
        if (this.addItemEl && this.term) {
            this.container.appendChild(this.addItemEl);
        }

        this.dispatch('updateResults', result, pages);
    },
    onSelect: function (item, replace) {
        switch (this.options.showSelected) {
            case 'highlighted':
                this.highlightItem(item, 'active', replace);
                break;
            case 'hidden':
                if ('element' in item) {
                    item.element.style.display = 'none';
                }
                break;
        }
    },
    onUnselect: function (item) {
        switch (this.options.showSelected) {
            case 'highlighted':
                item.element.classList.remove('active');
                break;
            case 'hidden':
                if ('element' in item) {
                    item.element.style.display = 'block';
                }
                break;
        }
    },
    highlightItem: function (item, className, replace, scrollTo) {
        var currHighlighted, items, index;

        className = className || 'highlight';

        if (replace) {
            currHighlighted = this.container.querySelector('.'+className);
            if (currHighlighted) {
                currHighlighted.classList.remove(className);
            }
        }

        currHighlighted = null;
        items = this.container.querySelectorAll('.item');
        if ('element' in item) {
            item.element.classList.add(className);
            currHighlighted = item.element;
            forEach(items, function (it, idx) {
                if (it == currHighlighted) {
                    index = idx;
                }
            });
        } else {
            index = 0;
            forEach(items, function (it, idx) {
                if (it.getAttribute('data-value') == item.value) {
                    it.classList.add(className);
                    currHighlighted = it;
                    index = idx;
                }
            });
        }

        if (currHighlighted && scrollTo) {
            if (currHighlighted.offsetTop < this.container.scrollTop) {
                this.container.scrollTop = currHighlighted.offsetTop;
            } else if (currHighlighted.offsetTop + currHighlighted.offsetHeight > this.container.scrollTop + this.container.clientHeight) {
                this.container.scrollTop = (currHighlighted.offsetTop + currHighlighted.offsetHeight) - this.container.clientHeight;
            }
        }

        return index;
    },
    setTerm: function (term) {
        this.term = term;
        if (this.addItemEl) {
            this.addItemEl.innerHTML = this.addItemTemplate.replace(/\{term\}/g, term);
        }
    }
});

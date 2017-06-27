FilterKit.CollectionViews.Div = extend(Object, {
    init: function (el, collection, options) {
        var templateEl;

        this.container = FilterKit.resolveElement(el);
        this.collection = collection;
        this.options = FilterKit.resolveOptions(options, {
            showSelected: 'highlighted',
            maxVisible: 0
        });

        templateEl = this.container.querySelector('.itemtemplate');
        if (templateEl) {
            this.template = templatify(templateEl.innerHTML);
            templateEl.parentElement.removeChild(templateEl);
        }

        collection.on('update', this.onUpdate.bind(this));
        collection.on('selectItem', this.onSelect.bind(this));

        this.container.addEventListener('click', function (e) {
            e.preventDefault();
            if (e.target.classList.contains('item')) {
                collection.selectItem(e.target.getAttribute('data-value'), true);
            }
        });
    },
    onUpdate: function (result) {
        var i, html, numVisible;

        if (typeof result == 'string') {
            this.container.innerHTML = result;
        } else if (this.template) {
            for (i = 0; i < result.length; i++) {
                if (!result[i].isSelected || this.options.showSelected != 'hidden') {
                    html += this.template(result[i]);
                    if (++numVisible >= this.options.maxVisible && this.options.maxVisible > 0) {
                        break;
                    }
                }
            }
            this.container.innerHTML = html;
        } else {
            for (i = 0; i < result.length; i++) {
                if ('element' in result[i]) {
                    if (result[i].isFiltered && (!result[i].isSelected || this.options.showSelected != 'hidden')) {
                        result[i].element.style.display = 'block';
                        if (++numVisible >= this.options.maxVisible && this.options.maxVisible > 0) {
                            break;
                        }
                    } else {
                        result[i].element.style.display = 'none';
                    }
                }
            }
        }
    },
    onSelect: function (item, replace) {
        switch (this.options.showSelected) {
            case 'highlighted':
                this.highlightItem(item, 'active', replace);
                break;
            case 'hidden':
                item.element.style.display = 'none';
                break;
        }
    },
    highlightItem: function (item, className, replace) {
        var currHighlighted, items;

        className = className || 'highlight';

        if (replace) {
            currHighlighted = this.container.querySelector('.'+className);
            if (currHighlighted) {
                currHighlighted.classList.remove(className);
            }
        }

        if ('element' in item) {
            item.element.classList.add(className);
        } else {
            items = this.container.querySelectorAll('.item');
            forEach(items, function (it) {
                if (it.getAttribute('data-value') == item.value) {
                    it.classList.add(className);
                }
            });
        }
    }
});

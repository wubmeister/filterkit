FilterKit.CollectionViews.Div = extend(Object, {
    init (el, collection) {
        var templateEl;

        this.container = FilterKit.resolveElement(el);
        this.collection = collection;

        templateEl = this.container.querySelector('.itemtemplate');
        if (templateEl) {
            this.template = templatify(templateEl.innerHTML);
            templateEl.parentElement.removeChild(templateEl);
        }

        collection.on('update', this.onUpdate.bind(this));
    },
    onUpdate: function (result) {
        var i, html;

        if (typeof result == 'string') {
            this.container.innerHTML = result;
        } else if (this.template) {
            for (i = 0; i < result.length; i++) {
                html += this.template(result[i]);
            }
            this.container.innerHTML = html;
        } else {
            for (i = 0; i < result.length; i++) {
                if ('element' in result[i]) {
                    result[i].element.style.display = result[i].isFiltered ? 'block' : 'none';
                }
            }
        }
    }
});

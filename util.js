FilterKit.Util.Searchbar = function (searchbarEl, collectionEl, options) {
    var filters, searchbar, collection, collectionView;

    options = FilterKit.resolveOptions(options, {
        realTime: false,
        collectionType: 'dom',
        baseUrl: '/'
    });

    filters = new FilterKit.Filters();
    searchbar = new FilterKit.Controls.Textfield(searchbarEl, filters, options);
    switch (options.collectionType) {
        case 'ajax_json':
            collection = new FilterKit.Collections.AjaxJSON(filters, options);
            break;

        case 'ajax_html':
            collection = new FilterKit.Collections.AjaxHTML(filters, options);
            break;

        default:
            collection = new FilterKit.Collections.DOM(collectionEl, filters, options);
            break;
    }

    collectionView = new FilterKit.CollectionViews.Div(collectionEl, collection);

    return filters;
};

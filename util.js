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

FilterKit.Util.SelectionDropdown = function (el, options) {
    var dropdown, input, valueLabel, itemContainer, valueInput,
        filters, searchInput, collection, collectionView, output,
        collapseTimeout, hlIndex;

    dropdown = FilterKit.resolveElement(el);

    // Ensure value input
    valueInput = dropdown.querySelector('input[type="hidden"]');
    if (!valueInput) {
        valueInput = FilterKit.createElement('input[type="hidden"]');
        dropdown.insertBefore(valueInput, dropdown.firstElementChild);
    }

    // Ensure textfield
    input = dropdown.querySelector('input[type="text"]');
    if (!input) {
        input = FilterKit.createElement('input[type="text"]');
        dropdown.insertBefore(input, dropdown.firstElementChild);
    }
    input.name = 'label';

    // Ensure value label
    valueLabel = dropdown.querySelector('.value');
    if (!valueLabel) {
        valueLabel = FilterKit.createElement('div.value');
        dropdown.insertBefore(valueLabel, input.nextElementSibling);
    }

    // Item container
    itemContainer = dropdown.querySelector('.items');

    // Create extra elements
    (function(){
        var contentPanel, panel, ddIcon;

        contentPanel = FilterKit.createElement('div.contentpanel');
        dropdown.appendChild(contentPanel);

        panel = dropdown.querySelector('.panel');

        if (itemContainer) {
            contentPanel.appendChild(itemContainer);
        }
        if (panel) {
            contentPanel.appendChild(panel);
        }

        ddIcon = dropdown.querySelector('.dropdown.icon');
        if (!ddIcon) {
            ddIcon = FilterKit.createElement('i.dropdown.icon');
            dropdown.insertBefore(ddIcon, contentPanel);
        }
    })();

    function expand() {
        cancelCollapse();
        dropdown.classList.add('expanded');
    }

    function delayToCollapse() {
        collapseTimeout = setTimeout(function () {
            collapseTimeout = null;
            dropdown.classList.remove('expanded');
        }, 200);
    }

    function cancelCollapse() {
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
            collapseTimeout = null;
        }
    }

    filters = new FilterKit.Filters();
    searchInput = new FilterKit.Controls.Textfield(input, filters, { keyboardNavigation: true, realTime: true });
    collection = new FilterKit.Collections.DOM(itemContainer, filters);
    collectionView = new FilterKit.CollectionViews.Div(itemContainer, collection);
    output = new FilterKit.SelectOutput.Text(valueLabel);

    hlIndex = -1;

    searchInput.onNavigationKey = function (key) {
        var index, item;

        switch (key) {
            case NAVKEY_UPARROW:
                index = collection.getPreviousFilteredItem(hlIndex, false, true);
                item = index < collection.items.length ? collection.items[index] : null;

                if (item) {
                    collectionView.highlightItem(item, 'highlight', true);
                    hlIndex = index;
                }
                break;

            case NAVKEY_DOWNARROW:
                index = collection.getNextFilteredItem(hlIndex, false, true);
                item = index < collection.items.length ? collection.items[index] : null;

                if (item) {
                    collectionView.highlightItem(item, 'highlight', true);
                    hlIndex = index;
                }
                break;

            case NAVKEY_RETURN:
                if (hlIndex > -1) {
                    item = collection.items[hlIndex];
                    collection.selectItem(item, true);
                }
                break;
        }
    }

    collection.on('selectItem', function (item) {
        output.selectValue(item.value, item.label);
        valueInput.value = item.value;
        input.blur();
    });

    input.addEventListener('focus', function () {
        expand();
    });

    input.addEventListener('blur', function () {
        delayToCollapse();
    });
};

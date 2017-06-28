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
    var dropdown, input, valueLabel, itemContainer, valueInput, listOutput,
        filters, searchInput, collection, collectionView, outputs,
        collapseTimeout, hlIndex, chips, isFocused;

    dropdown = FilterKit.resolveElement(el);

    options = FilterKit.resolveOptions(options, {
        multiple: dropdown.classList.contains('multiple'),
        collectionType: 'dom',
        inputName: 'search'
    });

    // Wrapper
    (function() {
        var wrapper = FilterKit.createElement('div.fdropdownwrap');
        if (dropdown.classList.contains('fluid')) {
            wrapper.classList.add('fluid');
        }
        if (dropdown.classList.contains('solid')) {
            wrapper.classList.add('solid');
        }
        dropdown.parentElement.insertBefore(wrapper, dropdown);
        wrapper.appendChild(dropdown);

        // Try list output
        listOutput = dropdown.querySelector('.list');
        if (listOutput) {
            listOutput.classList.add('fblocks');
            wrapper.parentElement.insertBefore(listOutput, wrapper);
        }
    })();

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
    input.name = options.collectionType == 'dom' ? 'label' : options.inputName || input.name;

    // Ensure value label
    valueLabel = dropdown.querySelector('.value');
    if (!valueLabel) {
        valueLabel = FilterKit.createElement('div.value');
        dropdown.insertBefore(valueLabel, input.nextElementSibling);
    }
    if (options.multiple) {
        valueLabel.classList.add('chips');
        valueLabel.appendChild(input);
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
        isFocused = true;
        dropdown.classList.add('expanded');
    }

    function delayToCollapse() {
        collapseTimeout = setTimeout(function () {
            collapseTimeout = null;
            isFocused = false;
            dropdown.classList.remove('expanded');
        }, 200);
    }

    function cancelCollapse() {
        if (collapseTimeout) {
            clearTimeout(collapseTimeout);
            collapseTimeout = null;
        }
    }

    outputs = [];

    filters = new FilterKit.Filters();
    searchInput = new FilterKit.Controls.Textfield(input, filters, { keyboardNavigation: true, realTime: true, filledClass: 'filled' });

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

    collectionView = new FilterKit.CollectionViews.Div(itemContainer, collection, { showSelected: options.multiple ? 'hidden' : 'highlighted', multiple: options.multiple });

    if (options.multiple) {
        chips = new FilterKit.SelectOutput.Chips(valueLabel);
        outputs.push(chips);
        chips.on('removeValue', function (value) {
            // console.log('Remove ' + value);
            collection.unselectItem(value);
        });

        if (listOutput) {
            outputs.push(new FilterKit.SelectOutput.Blocks(listOutput));
        }
    } else {
        outputs.push(new FilterKit.SelectOutput.Text(valueLabel));
    }

    hlIndex = -1;

    searchInput.onNavigationKey = function (key) {
        var index, item;

        switch (key) {
            case NAVKEY_UPARROW:
                index = collection.getPreviousFilteredItem(hlIndex, false, true);
                item = index < collection.items.length ? collection.items[index] : null;

                if (item) {
                    collectionView.highlightItem(item, 'highlight', true, true);
                    hlIndex = index;
                }
                break;

            case NAVKEY_DOWNARROW:
                index = collection.getNextFilteredItem(hlIndex, false, true);
                item = index < collection.items.length ? collection.items[index] : null;

                if (item) {
                    collectionView.highlightItem(item, 'highlight', true, true);
                    hlIndex = index;
                }
                break;

            case NAVKEY_RETURN:
                if (hlIndex > -1) {
                    item = collection.items[hlIndex];
                    collection.selectItem(item, !options.multiple);
                }
                break;

            case NAVKEY_BACKSPACE_EMPTY:
                if (chips) {
                    if (chips.hasPreselected()) {
                        chips.removePreselected();
                    } else {
                        chips.preselectChip();
                    }
                }
                break;
        }
    }

    collection.on('selectItem', function (item) {
        outputs.forEach(function (output) {
            output.selectValue(item.value, item.label);
        });
        valueInput.value = item.value;
        input.value = '';
        input.classList.remove('filled');
        hlIndex = -1;
        if (options.multiple) {
            input.focus();
        } else {
            input.blur();
        }
    });
    collection.on('unselectItem', function (item) {
        outputs.forEach(function (output) {
            output.unselectValue(item.value);
        });
        if (options.multiple && isFocused) {
            input.focus();
        }
    });

    input.addEventListener('focus', function () {
        expand();
    });

    input.addEventListener('blur', function () {
        delayToCollapse();
    });
};

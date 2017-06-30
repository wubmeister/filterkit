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
        collapseTimeout, hlIndex, chips, list, isFocused, values, wrapper,
        wrapperPadding, display, contentPanel;

    dropdown = FilterKit.resolveElement(el);

    options = FilterKit.resolveOptions(options, {
        multiple: dropdown.classList.contains('multiple'),
        collectionType: 'dom',
        inputName: 'search',
        fieldName: null,
        blockHtml: null,
        list: null
    });

    // Get values
    (function(){
        var inputs = _('input,select', dropdown);

        values = [];
        inputs.each(function () {
            var i;

            if (this.nodeName == 'SELECT') {
                for (i = 0; i < this.options.length; i++) {
                    if (this.options[i].selected && this.options[i].value) {
                        values.push(this.options[i].value);
                    }
                }
            } else if (this.value) {
                if (this.name.substr(-2) == '[]') {
                    values.push(this.value);
                } else {
                    values = [ this.value ];
                }
                if (!options.fieldName) {
                    options.fieldName = this.name;
                }
            }
        });
        inputs.remove();
    })();

    // Wrapper
    (function() {
        var style;

        wrapper = FilterKit.createElement('div.fk-dropdownwrap');
        if (dropdown.classList.contains('fluid')) {
            wrapper.classList.add('fluid');
        }
        if (dropdown.classList.contains('solid')) {
            wrapper.classList.add('solid');
        }
        dropdown.parentElement.insertBefore(wrapper, dropdown);
        wrapper.appendChild(dropdown);

        // Try list output
        if (options.list) {
            listOutput = FilterKit.resolveElement(options.list);
        } else {
            listOutput = dropdown.querySelector('.list');
        }
        if (listOutput) {
            listOutput.classList.add('fk-blocks');
            if (!options.list || _(options.list).closest('.fk-dropdown').length > 0) {
                wrapper.parentElement.insertBefore(listOutput, wrapper);
            }
        }

        style = getComputedStyle(dropdown);
        wrapperPadding = parseInt(style.paddingTop) + parseInt(style.paddingBottom) + (wrapper.offsetHeight - wrapper.clientHeight);

        display = FilterKit.createElement('div.fk-disp');
        dropdown.insertBefore(display, dropdown.firstChild);
    })();

    // Ensure value input
    valueInput = dropdown.querySelector('input[type="hidden"]');
    if (!valueInput) {
        valueInput = FilterKit.createElement('input[type="hidden"]');
        display.insertBefore(valueInput, display.firstElementChild);
    }

    // Ensure textfield
    input = dropdown.querySelector('input[type="text"]');
    if (!input) {
        input = FilterKit.createElement('input[type="text"]');
        if (options.placeholder) {
            input.setAttribute('placeholder', options.placeholder);
        }
        display.insertBefore(input, display.firstElementChild);
    }
    input.name = options.collectionType == 'dom' ? 'label' : options.inputName || input.name;

    // Ensure value label
    valueLabel = dropdown.querySelector('.value');
    if (!valueLabel) {
        valueLabel = FilterKit.createElement('div.value');
        input.parentElement.insertBefore(valueLabel, input.nextElementSibling);
    }
    if (options.multiple) {
        valueLabel.classList.add('chips');
        valueLabel.appendChild(input);
    } else {
        display.insertBefore(FilterKit.createElement('i.fk-searchicon'), display.firstElementChild);
    }

    // Item container
    itemContainer = dropdown.querySelector('.items');

    // Create extra elements
    (function(){
        var panel, ddIcon;

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
        }
        display.appendChild(ddIcon);
    })();

    function expand() {
        cancelCollapse();
        updateDirection();
        isFocused = true;
        dropdown.classList.add('expanded');
        if (options.onShow) {
            options.onShow();
        }
    }

    function delayToCollapse() {
        collapseTimeout = setTimeout(function () {
            collapseTimeout = null;
            isFocused = false;
            dropdown.classList.remove('expanded');
            if (options.onHide) {
                options.onHide();
            }
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
        chips = new FilterKit.SelectOutput.Chips(valueLabel, { name: options.fieldName, addHiddenInput: true });
        outputs.push(chips);
        chips.on('removeValue', function (value) {
            collection.unselectItem(value);
        });

        if (listOutput) {
            list = new FilterKit.SelectOutput.Blocks(listOutput);
            outputs.push(list);
            if (options.blockHtml) {
                list.blockHtml = options.blockHtml;
            }
        }
    } else {
        outputs.push(new FilterKit.SelectOutput.Text(valueLabel));
    }

    hlIndex = -1;

    searchInput.onNavigationKey = function (key) {
        var index, item;

        switch (key) {
            case NAVKEY_UPARROW:
                index = collection.getPreviousFilteredItem(hlIndex, false, true, options.multiple);
                item = index < collection.items.length ? collection.items[index] : null;

                if (item) {
                    collectionView.highlightItem(item, 'highlight', true, true);
                    hlIndex = index;
                }
                break;

            case NAVKEY_DOWNARROW:
                index = collection.getNextFilteredItem(hlIndex, false, true, options.multiple);
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
    };

    searchInput.onChange = function (value) {
        collectionView.setTerm(value);
    }

    function clearInput() {
        input.value = '';
        input.classList.remove('filled');
        collectionView.setTerm('');
        filters.addValue(input.name, '', 'like', true);
    }

    function updateWrapperHeight() {
        wrapper.style.height = (valueLabel.scrollHeight + wrapperPadding - (options.multiple ? 6 : 0)) + 'px';
    }

    function updateDirection() {
        var scrollTop = window.pageYOffset,
            vpHeight = window.innerHeight || document.documentElement.offsetHeight,
            offset = _(wrapper).offset();

        if (offset.top + wrapper.offsetHeight + contentPanel.offsetHeight > scrollTop + vpHeight && offset.top - contentPanel.offsetHeight > scrollTop) {
            dropdown.classList.add('reverse');
        } else {
            dropdown.classList.remove('reverse');
        }
    }

    collection.on('selectItem', function (item) {
        outputs.forEach(function (output) {
            output.selectValue(item);
        });
        valueInput.value = item.value;
        clearInput();
        hlIndex = -1;
        if (!options.multiple && options.onChange) {
            options.onChange(item.value, item.label);
        } else if (options.multiple && options.onLabelCreate) {
            options.onLabelCreate(item.value, item.label);
        }
        updateWrapperHeight();
        if (options.multiple && isFocused) {
            input.focus();
        } else {
            input.blur();
        }
    });
    collection.on('beforeUnselectItem', function (item) {
        if (options.multiple && options.onLabelRemove) {
            return options.onLabelRemove(item.value);
        }
    });
    collection.on('unselectItem', function (item) {
        outputs.forEach(function (output) {
            output.unselectValue(item.value);
        });
        updateWrapperHeight();
        if (options.multiple && isFocused) {
            input.focus();
        }
    });

    collectionView.on('addItem', function (term) {
        var item;
        if (options.onAdd) {
            item = options.onAdd(term);
            if (item) {
                if (item instanceof Promise) {
                    item.then(function (item) {
                        collection.addItem(item);
                        collection.selectItem(item);
                    });
                } else {
                    collection.addItem(item);
                    collection.selectItem(item);
                }
            }
        }
    });

    input.addEventListener('focus', function () {
        expand();
    });

    input.addEventListener('blur', function () {
        delayToCollapse();
    });

    filters.on('exactMatch', function (item) {
        hlIndex = collectionView.highlightItem(item, 'highlight', true, true);
    });

    // Preselect values
    (function(){
        var i;

        for (i = 0; i < values.length; i++) {
            collection.selectItem(values[i]);
        }
    })();
};

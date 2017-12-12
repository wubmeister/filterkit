const NAVKEY_BACKSPACE = 8;
const NAVKEY_BACKSPACE_EMPTY = 88;
const NAVKEY_UPARROW = 38;
const NAVKEY_DOWNARROW = 40;
const NAVKEY_RETURN = 13;

FilterKit.Controls.Textfield = extend(Object, {
    init: function (el, filters, options) {
        var that = this, handlingInput = false;

        input = FilterKit.resolveElement(el);

        options = FilterKit.resolveOptions(options, {
            realTime: false,
            keyboardNavigation: false,
            operand: 'like',
            filledClass: null,
            updateTags: true
        }, input);

        this.filters = filters;
        this.options = options;
        this.input = input;

        if (input) {
            if (!input.name) {
                input.name = FilterKit.getUid('textfield');
            }
            input.addEventListener('keydown', function (e) {
                handlingInput = true;
                if (e.which == 13) {
                    e.preventDefault();
                } else if (options.keyboardNavigation && (e.which == NAVKEY_UPARROW || e.which == NAVKEY_DOWNARROW)) {
                    e.preventDefault();
                    that.onNavigationKey(e.which);
                }
                this.lastValue = this.value;
                handlingInput = false;
            });
            input.addEventListener('keyup', function (e) {
                handlingInput = true;
                if (e.which == 13) {
                    e.preventDefault();
                    filters.addValue(this.name, this.value, options.operand, true, !options.updateTags);
                    that.onChange(this.value);
                } else if (options.realTime) {
                    if (this.value != this.lastValue) {
                        filters.addValue(this.name, this.value, options.operand, true, !options.updateTags);
                        that.onChange(this.value);
                    }
                }

                if (options.filledClass) {
                    if (this.value) this.classList.add(options.filledClass);
                    else this.classList.remove(options.filledClass);
                }

                if (options.keyboardNavigation && (e.which == NAVKEY_BACKSPACE || e.which == NAVKEY_RETURN)) {
                    if (e.which == NAVKEY_BACKSPACE && !this.lastValue) {
                        that.onNavigationKey(NAVKEY_BACKSPACE_EMPTY);
                    } else {
                        that.onNavigationKey(e.which);
                    }
                }
                handlingInput = false;
            });

            if (options.updateTags) {
                filters.on('addtag', function (tag) {
                    if (!handlingInput) {
                        if (tag.key == input.name) {
                            input.value = tag.value;
                        }
                    }
                });
                filters.on('removetag', function (tag) {
                    if (!handlingInput) {
                        if (tag.key == input.name) {
                            input.value = '';
                        }
                    }
                });
            }

            if (input.value && input.value != '') {
                filters.cancelEvents();
                filters.addValue(input.name, input.value, options.operand, true, !options.updateTags);
                filters.cancelEvents(false);
            }
        }
    },
    onNavigationKey: function (key) {
    },
    onChange: function (value) {
    },
    submitChanges: function () {
        console.log('submitting thhe changes', this);
        handlingInput = true;
        this.filters.addValue(this.input.name, this.input.value, this.options.operand, true, !this.options.updateTags);
        this.onChange(this.input.value);
        handlingInput = false;
    }
});
FilterKit.Controls.Checkboxes = extend(Object, {
    init: function (el, filters) {
        var container, checkboxes, cancelEvents;

        function onCbChange(e) {
            if (!cancelEvents) {
                if (this.checked) {
                    filters.addValue(this.filterName, this.value);
                } else {
                    filters.removeValue(this.filterName, this.value);
                }
            }
            cancelEvents = false;
        }

        container = FilterKit.resolveElement(el);

        checkboxes = container.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length) {
            filters.cancelEvents();

            forEach(checkboxes, function (checkbox) {
                checkbox.filterName = checkbox.name.replace(/\[\]$/, '');
                checkbox.addEventListener('change', onCbChange);
                if (checkbox.checked) {
                    onCbChange.call(checkbox);
                }
            });

            filters.on('addtag', function (tag) {
                forEach(checkboxes, function (checkbox) {
                    if (checkbox.filterName == tag.key && checkbox.value == tag.value) {
                        checkbox.checked = true;
                        cancelEvents = true;
                        _(checkbox).trigger('change');
                    }
                });
            });

            filters.on('removetag', function (tag) {
                forEach(checkboxes, function (checkbox) {
                    if (checkbox.filterName == tag.key && checkbox.value == tag.value) {
                        checkbox.checked = false;
                        cancelEvents = true;
                        _(checkbox).trigger('change');
                    }
                });
            });

            filters.cancelEvents(false);
        }
    }
});
FilterKit.Controls.RadioButtons = extend(Object, {
    init: function (el, filters) {
        var container, radioButtons;

        function onRadioChange(e) {
            if (this.checked) {
                filters.addValue(this.name, this.value, 'eq', true);
            }
        }

        container = FilterKit.resolveElement(el);

        radioButtons = container.querySelectorAll('input[type="radio"]');
        if (radioButtons.length) {
            filters.cancelEvents();

            forEach(radioButtons, function (radio) {
                radio.addEventListener('change', onRadioChange);
                if (radio.checked) {
                    onRadioChange.call(radio);
                }
            });

            filters.on('addtag', function (tag) {
                forEach(radioButtons, function (radio) {
                    if (radio.name == tag.key) {
                        radio.checked = (radio.value == tag.value);
                    }
                });
            });

            filters.on('removetag', function (tag) {
                forEach(radioButtons, function (radio) {
                    if (radio.name.filterName == tag.key && radio.value == tag.value) {
                        radio.checked = false;
                    }
                });
            });

            filters.cancelEvents(false);
        }
    }
});
FilterKit.Controls.Select = extend(Object, {
    init: function (el, filters) {
        var select, radioButtons;

        function onSelectChange(e) {
            var currOptions, newOptions, name;

            name = this.name;
            if (this.multiple) {
                currOptions = this.lastSelectedOptions || [];
                newOptions = [];
                forEach(this.options, function (option) {
                    if (option.selected) {
                        newOptions.push(option.value);
                    }
                });

                forEach(currOptions, function (option) {
                    if (newOptions.indexOf(option) == -1) {
                        filters.removeValue(name, option);
                    }
                });
                forEach(newOptions, function (option) {
                    if (currOptions.indexOf(option) == -1) {
                        filters.addValue(name, option);
                    }
                });
                this.lastSelectedOptions = newOptions;
            } else if (this.selectedIndex > -1) {
                filters.addValue(this.name, this.options[this.selectedIndex].value, 'eq', true);
            }
        }

        select = FilterKit.resolveElement(el);

        if (select) {
            select.addEventListener('change', onSelectChange);
            filters.cancelEvents();
            onSelectChange.call(select);
            filters.cancelEvents(false);

            filters.on('addtag', function (tag) {
                if (select.name == tag.key) {
                    forEach(select.options, function (option) {
                        if (option.value == tag.value) {
                            option.selected = true;
                        }
                    });
                }
            });

            filters.on('removetag', function (tag) {
                if (select.name == tag.key) {
                    forEach(select.options, function (option) {
                        if (option.value == tag.value) {
                            option.selected = false;
                        }
                    });
                    if (!select.multiple) {
                        select.selectedIndex = -1;
                    }
                }
            });
        }
    }
});
FilterKit.Controls.Container = extend(Object, {
    init: function (el, filters, options) {
        var container, radioButtons, checkboxes, inputs, selects;

        function onInputChange(e) {
            var name, values, lastValues, oldValues, newValues;

            name = this.name.replace(/\[\]$/, '')

            if (/\[\]$/.test(this.name)) {
                lastValues = this.lastValue ? this.lastValue.split(',') : [];
                values = this.value.split(',');
                oldValues = lastValues.filter(function (item) { return values.indexOf(item) == -1; });
                newValues = values.filter(function (item) { return lastValues.indexOf(item) == -1; });

                forEach (oldValues, function (value) {
                    filters.removeValue(name, value, 'eq');
                });
                forEach (newValues, function (value) {
                    if (value != '') {
                        filters.addValue(name, value, 'eq');
                    }
                });
            } else {
                filters.addValue(name, this.value, 'eq', true);
            }

            this.lastValue = this.value;
        }

        container = FilterKit.resolveElement(el);

        options = FilterKit.resolveOptions(options, {
            realTime: false,
            textFieldOperand: 'like'
        }, container);

        new FilterKit.Controls.Checkboxes(container, filters);
        new FilterKit.Controls.RadioButtons(container, filters);

        inputs = container.querySelectorAll('input[type="text"]');
        forEach(inputs, function (input) {
            new FilterKit.Controls.Textfield(input, filters, {
                realTime: options.realTime,
                operand: options.textFieldOperand
            });
        });

        inputs = container.querySelectorAll('input[type="hidden"]');
        forEach(inputs, function (input) {
            input.addEventListener('change', onInputChange);
            if (input.value) onInputChange.call(input);
        });

        selects = container.querySelectorAll('select');
        forEach(selects, function (select) {
            new FilterKit.Controls.Select(select, filters);
        });
    }
});

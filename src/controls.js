const NAVKEY_BACKSPACE = 8;
const NAVKEY_BACKSPACE_EMPTY = 88;
const NAVKEY_UPARROW = 38;
const NAVKEY_DOWNARROW = 40;
const NAVKEY_RETURN = 13;

FilterKit.Controls.Textfield = extend(Object, {
    init: function (el, filters, options) {
        var that = this;

        input = FilterKit.resolveElement(el);

        options = FilterKit.resolveOptions(options, {
            realTime: false,
            keyboardNavigation: false,
            operand: 'like',
            filledClass: null
        });

        if (input) {
            if (!input.name) {
                input.name = FilterKit.getUid('textfield');
            }
            input.addEventListener('keydown', function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                } else if (options.keyboardNavigation && (e.which == NAVKEY_UPARROW || e.which == NAVKEY_DOWNARROW)) {
                    e.preventDefault();
                    that.onNavigationKey(e.which);
                }
                this.lastValue = this.value;
            });
            input.addEventListener('keyup', function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    if (this.value != this.lastValue) {
                        filters.addValue(this.name, this.value, options.operand, true);
                        that.onChange(this.value);
                    }
                } else if (options.realTime) {
                    if (this.value != this.lastValue) {
                        filters.addValue(this.name, this.value, options.operand, true);
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
            });
        }
    },
    onNavigationKey: function (key) {
    },
    onChange: function (value) {
    }
});
FilterKit.Controls.Checkboxes = extend(Object, {
    init: function (el, filters) {
        var container, checkboxes;

        function onCbChange(e) {
            if (this.checked) {
                filters.addValue(this.name.replace(/\[\]$/, ''), this.value);
            } else {
                filters.removeValue(this.name.replace(/\[\]$/, ''), this.value);
            }
        }

        container = FilterKit.resolveElement(el);

        checkboxes = container.querySelectorAll('input[type="checkbox"]');
        forEach(checkboxes, function (checkbox) {
            checkbox.addEventListener('change', onCbChange);
        });
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
        forEach(radioButtons, function (radio) {
            radio.addEventListener('change', onRadioChange);
        });
    }
});
FilterKit.Controls.Container = extend(Object, {
    init: function (el, filters, options) {
        var container, radioButtons, checkboxes, inputs;

        options = FilterKit.resolveOptions(options, {
            realTime: false,
            textFieldOperand: 'like'
        });

        function onCbChange(e) {
            if (this.checked) {
                filters.addValue(this.name.replace(/\[\]$/, ''), this.value);
            } else {
                filters.removeValue(this.name.replace(/\[\]$/, ''), this.value);
            }
        }

        function onRadioChange(e) {
            if (this.checked) {
                filters.addValue(this.name, this.value, 'eq', true);
            }
        }

        function onKeyDown(e) {
            if (e.which == 13) {
                e.preventDefault();
            }
        }

        function onKeyUp(e) {
            if (e.which == 13) {
                e.preventDefault();
                filters.addValue(this.name, this.value, options.textFieldOperand, true);
            } else if (options.realTime) {
                filters.addValue(this.name, this.value, options.textFieldOperand, true);
            }
        }

        container = FilterKit.resolveElement(el);

        checkboxButtons = container.querySelectorAll('input[type="checkbox"]');
        forEach(checkboxButtons, function (checkbox) {
            checkbox.addEventListener('change', onCbChange);
        });

        radioButtons = container.querySelectorAll('input[type="radio"]');
        forEach(radioButtons, function (radio) {
            radio.addEventListener('change', onRadioChange);
        });

        inputs = container.querySelectorAll('input[type="text"]');
        forEach(inputs, function (input) {
            input.addEventListener('keyup', onKeyUp);
            input.addEventListener('keydown', onKeyDown);
        });
    }
});

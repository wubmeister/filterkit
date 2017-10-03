FilterKit.SelectOutput.Chips = extend(UtilEventDispatcher, {
    itemClass: 'chip',
    init: function (el, options) {
        var output = this;

        this.container = FilterKit.resolveElement(el);
        this.options = FilterKit.resolveOptions(options, {
            name: null,
            addHiddenInput: false
        }, this.container);

        _(this.container).delegate('click', '.close.icon', function () {
            output.removeChip(this.parentElement);
        });
        _(this.container).delegate('click', '.'+this.itemClass, function (e) {
            if (e.target == this) {
                output.preselectChip(this);
            }
        });

        window.addEventListener('keyup', function (e) {
            if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'TEXTAREA' && e.which == 8) {
                output.removePreselected();
            }
        });

        _(this.container).trigger('fk.init');
    },
    getLastChip: function () {
        var lastChip, child;

        for (child = this.container.lastElementChild; child; child = child.previousElementSibling) {
            if (child.classList.contains(this.itemClass)) {
                lastChip = child;
                break;
            }
        }

        return lastChip;
    },
    createChild: function (item) {
        var chip = FilterKit.createElement('div.chip', { dataValue: item.value });
        if (this.chipHtml) {
            chip.innerHTML = this.chipHtml(item);
            if (!chip.querySelector('.close.icon')) {
                chip.innerHTML += '<i class="close icon"></i>';
            }
            if (this.options.addHiddenInput && this.options.name) {
                chip.innerHTML += '<input type="hidden" name="' + this.options.name + '" value="' + item.value + '">';
            }
        } else {
            chip.innerHTML = item.label + ' <i class="close icon"></i>' +
                (this.options.addHiddenInput && this.options.name ? '<input type="hidden" name="' + this.options.name + '" value="' + item.value + '">' : '');
        }
        return chip;
    },
    selectValue: function (item, fullItem) {
        var lastChip, child;

        child = this.createChild(item);
        lastChip = this.getLastChip();
        this.container.insertBefore(child, lastChip ? lastChip.nextSibling : this.container.firstChild);

        _(this.container).trigger('fk.additem', { item: lastChip });
    },
    unselectValue: function (value) {
        var chip = this.container.querySelector('[data-value="' + value + '"]');

        if (chip) {
            chip.parentElement.removeChild(chip);
        }
    },
    removeChip: function (chip) {
        this.dispatch('removeValue', chip.getAttribute('data-value'));
    },
    preselectChip: function (chip) {
        if (!chip) chip = this.getLastChip();
        if (chip) {
            _(chip).addClass('preselect').siblings().removeClass('preselect');
        }
    },
    hasPreselected: function () {
        return this.container.querySelector('.preselect.chip') ? true : false;
    },
    removePreselected: function () {
        var chip = this.container.querySelector('.preselect.' + this.itemClass);

        if (chip) {
            this.removeChip(chip);
        }
    }
});
FilterKit.SelectOutput.Blocks = extend(FilterKit.SelectOutput.Chips, {
    itemClass: 'block',
    createChild: function (item) {
        var block = FilterKit.createElement('div.block', { dataValue: item.value });
        block.innerHTML = this.blockHtml ? this.blockHtml(item) : item.label;
        if (this.options.addHiddenInput && this.options.name) {
            block.innerHTML += '<input type="hidden" name="' + this.options.name + '" value="' + item.value + '">';
        }
        if (!block.querySelector('.close.icon')) {
            block.innerHTML += '<i class="close icon"></i>';
        }
        block.setAttribute('data-value', item.value);
        return block;
    }
});
FilterKit.SelectOutput.Textfield = extend(Object, {
    init: function (el) {
        this.textField = FilterKit.resolveElement(el);
    },
    selectValue: function (item) {
        this.textField.value = item.label;
    },
    unselectValue: function (value) {
        this.textField.value = '';
    }
});
FilterKit.SelectOutput.Text = extend(Object, {
    init: function (el) {
        this.element = FilterKit.resolveElement(el);
    },
    selectValue: function (item) {
        this.element.innerHTML = item.label;
    },
    unselectValue: function (value) {
        this.element.innerHTML = '';
    }
});

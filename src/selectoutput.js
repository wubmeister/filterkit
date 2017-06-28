FilterKit.SelectOutput.Chips = extend(UtilEventDispatcher, {
    itemClass: 'chip',
    init: function (el, options) {
        var output = this;

        this.options = FilterKit.resolveOptions({
            name: null,
            addHiddenInput: false
        });
        this.container = FilterKit.resolveElement(el);

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
    createChild: function (value, label) {
        var chip = FilterKit.createElement('div.chip', { dataValue: value });
        chip.innerHTML = label + ' <i class="close icon"></i>' +
            (this.options.addHiddenInput && this.options.name ? '<input type="hidden" name="' + this.options.name + '" value="' + value + '">' : '');
        return chip;
    },
    selectValue: function (value, label, fullItem) {
        var lastChip, child;

        child = this.createChild(value, label);
        lastChip = this.getLastChip();
        this.container.insertBefore(child, lastChip ? lastChip.nextSibling : this.container.firstChild);
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
    createChild: function (value, label) {
        var block = FilterKit.createElement('div.block', { dataValue: value });
        block.innerHTML = label;
        return block;
    }
});
FilterKit.SelectOutput.Textfield = extend(Object, {
    init: function (el) {
        this.textField = FilterKit.resolveElement(el);
    },
    selectValue: function (value, label, fullItem) {
        this.textField.value = label;
    },
    unselectValue: function (value) {
        this.textField.value = '';
    }
});
FilterKit.SelectOutput.Text = extend(Object, {
    init: function (el) {
        this.element = FilterKit.resolveElement(el);
    },
    selectValue: function (value, label, fullItem) {
        this.element.innerHTML = label;
    },
    unselectValue: function (value) {
        this.element.innerHTML = '';
    }
});
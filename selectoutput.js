FilterKit.SelectOutput.Chips = extend(Object, {
    init: function (el) {
        this.container = FilterKit.resolveElement(el);
    },
    createChild: function (value, label) {
        var chip = FilterKit.createElement('div.chip');
        chip.innerHTML = label + ' <i class="close icon"></i>';
    },
    selectValue: function (value, label, fullItem) {
        var child = this.createChild(value, label, fullItem);
        this.container.appendChild(child);
    }
});
FilterKit.SelectOutput.Blocks = extend(FilterKit.SelectOutput.Chips, {
    createChild: function (value, label) {
        var chip = FilterKit.createElement('div.message');
        chip.innerHTML = label + '<br/><i class="close icon"></i>';
    }
});
FilterKit.SelectOutput.Textfield = extend(Object, {
    init: function (el) {
        this.textField = FilterKit.resolveElement(el);
    },
    selectValue: function (value, label, fullItem) {
        this.textField.value = label;
    }
});
FilterKit.SelectOutput.Text = extend(Object, {
    init: function (el) {
        this.element = FilterKit.resolveElement(el);
    },
    selectValue: function (value, label, fullItem) {
        this.element.innerHTML = label;
    }
});

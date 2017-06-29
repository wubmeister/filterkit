if ('$' in window) {
    $.fn.searchbar = function (target, options) {
        this.each(function () {
            this._filters = FilterKit.Util.Searchbar(this, target, options);
        });
        return this;
    };

    $.fn.fkDropdown = function (options) {
        this.each(function () {
            var $dd;

            options = FilterKit.resolveOptions(options, {
                allowAdditions: false,
                message: {
                    addResult: 'Add <strong>{term}</strong>',
                    noResults: 'No results found'
                }
            });

            if (this.nodeName == 'SELECT') {
                $dd = $('<div class="fk-dropdown"></div>').prependTo(this).append(this);
            } else {
                $dd = $(this);
            }

            if ($dd.find('.items').length == 0) {
                $dd.append('<div class="items"></div>');
            }
            if ($dd.find('.items .noresults').length == 0) {
                $dd.find('.items').append('<div class="noresults item">' + options.message.noResults + '</div>');
            }

            if (options.allowAdditions && $dd.find('.items .additem').length == 0) {
                $dd.find('.items').append('<div class="additem item">' + options.message.addResult + '</div>');
            }

            FilterKit.Util.SelectionDropdown($dd[0], options);
        });

        return this;
    }
}

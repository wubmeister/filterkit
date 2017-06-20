if ('$' in window) {
    $.fn.searchbar = function (target, options) {
        this.each(function () {
            this._filters = FilterKit.Util.Searchbar(this, target, options);
        });
        return this;
    };
}

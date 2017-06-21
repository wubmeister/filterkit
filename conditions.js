// Filter conditions

FilterKit.Conditions.Base = extend(Object, {
    init: function (initValue) {
        this.value = initValue || '';
    },
    addValue: function (value) {
        if (this.value instanceof Array) {
            if (value instanceof Array) {
                this.value = this.value.concat(value);
            } else {
                this.value.push(value);
            }
        } else {
            if (value instanceof Array) {
                this.value = [this.value].concat(value);
            } else {
                this.value = [ this.value, value ];
            }
        }
    },
    removeValue: function (value) {
        var index;

        if (this.value instanceof Array) {
            if (value instanceof Array) {
                this.value = this.value.diff(this.value, value);
            } else {
                index = this.value.indexOf(value);
                if (index > -1) {
                    this.value.splice(index, 1);
                }
            }
        } else if (this.value == value) {
            this.value = null;
        }
    },
    hasValues: function (value) {
        return this.value !== null && (!(this.value instanceof Array) || this.value.length > 0);
    },
    checkValue: function (value) {
        return true;
    },
    serializeQuery: function (name) {
        return '';
    }
});

FilterKit.Conditions.Eq = extend(FilterKit.Conditions.Base, {
    checkValue: function (value) {
        if (this.value instanceof Array) {
            if (value instanceof Array) {
                return this.value.intersect(value).length > 0;
            } else {
                return this.value.indexOf(value) > -1;
            }
        } else {
            if (value instanceof Array) {
                return value.indexOf(this.value) > -1;
            } else {
                return this.value == value;
            }
        }
    },
    serializeQuery: function (name) {
        var queryParts = [];

        if (this.value instanceof Array) {
            if (this.value.length == 1) {
                queryParts.push(name + '=' + encodeURIComponent(this.value[0]));
            } else {
                this.value.forEach(function (value) {
                    queryParts.push(name + '[]=' + encodeURIComponent(value));
                });
            }
        } else {
            queryParts.push(name + '=' + encodeURIComponent(this.value));
        }

        return queryParts.join('&');
    }
});

FilterKit.Conditions.Like = extend(FilterKit.Conditions.Base, {
    addValue: function (value) {
        this.value = value.toLowerCase();
    },
    checkValue: function (value) {
        return (''+value).toLowerCase().indexOf(this.value) > -1;
    },
    serializeQuery: function (name) {
        var queryParts = [];

        if (this.value instanceof Array) {
            if (this.value.length == 1) {
                queryParts.push(name + '=' + encodeURIComponent(this.value[0]));
            } else {
                this.value.forEach(function (value) {
                    queryParts.push(name + '[]=' + encodeURIComponent(value));
                });
            }
        } else {
            queryParts.push(name + '=' + encodeURIComponent(this.value));
        }

        return queryParts.join('&');
    }
});

FilterKit.Conditions.Lt = extend(FilterKit.Conditions.Base, {
    checkValue: function (value) {
        return value < this.value;
    },
    serializeQuery: function (name) {
        return name + '[lt]=' + encodeURIComponent(this.value);
    }
});

FilterKit.Conditions.Lte = extend(FilterKit.Conditions.Base, {
    checkValue: function (value) {
        return value <= this.value;
    },
    serializeQuery: function (name) {
        return name + '[lte]=' + encodeURIComponent(this.value);
    }
});

FilterKit.Conditions.Gt = extend(FilterKit.Conditions.Base, {
    checkValue: function (value) {
        return value > this.value;
    },
    serializeQuery: function (name) {
        return name + '[gt]=' + encodeURIComponent(this.value);
    }
});

FilterKit.Conditions.Gte = extend(FilterKit.Conditions.Base, {
    checkValue: function (value) {
        return value >= this.value;
    },
    serializeQuery: function (name) {
        return name + '[gte]=' + encodeURIComponent(this.value);
    }
});

FilterKit.Conditions.Geo = extend(FilterKit.Conditions.Base, {
    init: function (initValue) {
        this.addValue(initValue);
    },
    addValue: function (value) {
        var values;

        if (value instanceof Array) {
            value = value[0];
        }

        values = value.split(',');
        this.lat = parseFloat(values[0]);
        this.lng = parseFloat(values[1]);
        this.distance = parseFloat(values[2]);
        this.searchString = values.length > 3 ? values.slice(3).join(',') : null;
    },
    removeValue: function (value) {
        this.lat = null;
    },
    hasValues: function () {
        return this.lat !== null;
    },
    checkValue: function (value) {
        var distance;

        function radians(degrees) {
            return degrees * Math.PI / 180;
        }

        function degrees(radians) {
            return degrees * 180 / Math.PI;
        }

        distance = degrees(Math.acos(Math.cos(radians(90 - value.lat)) * Math.cos(radians(90 - this.lat)) + Math.sin(radians(90 - value.lat)) * Math.sin(radians(90 - thia.lat)) * Math.cos(radians(value.lng - this.lng)))) / 360 * 40074;

        return distance <= this.distance;
    },
    serializeQuery: function (name) {
        return name + '[geo]=' +
            encodeURIComponent(this.lat) + ',' +
            encodeURIComponent(this.lng) + ',' +
            encodeURIComponent(this.distance) +
            (this.searchString ? ',' + encodeURIComponent(this.searchString) : '');
    }
});

function Transitions(element) {
    var style, properties, durations, delays, index, time;

    this.element = element;

    style = getComputedStyle(element);
    this.properties = style.transitionProperty.split(/\s*,\s*/);
    this.durations = style.transitionDuration.split(/\s*,\s*/).map(parseFloat);
    this.delays = style.transitionDelay.split(/\s*,\s*/).map(parseFloat);
    this.indices = {};

    for (index = 0; index < this.properties.length; index++) {
        this.indices[this.properties[index]] = index;
    }
}
Transitions.prototype.getTime = function (property) {
    var index, time;

    if (property) {
        if (property in this.indices) {
            index = this.indices[property];
            return this.durations[index] + this.delays[index];
        }
    } else {
        time = 0;
        for (index = 0; index < durations.length; index++) {
            time = Math.max(time, durations[index] + delays[index]);
        }
        return time;
    }
};
Transitions.prototype.getTimeMS = function (property) {
    var time = Math.round(this.getTime(property) * 1000);
};
Transitions.prototype.set = function (property, duration, delay) {
    var index;

    if (!(property in this.indices)) {
        this.indices[property] = this.properties.length;
        this.properties.push(property);
    }

    index = this.indices[property];
    this.durations[index] = duration || 0;
    this.delays[index] = delay || 0;

    this.update();
};
Transitions.prototype.update = function () {
    var parts = [], index;

    for (index = 0; index < this.properties.length; index++) {
        parts.push(this.properties[index] + ' ' + this.durations[index] + 's ' + this.delays[index] + 's');
    }

    this.element.style.transition = parts.join(', ');
};

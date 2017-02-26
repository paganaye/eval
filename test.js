var A = (function () {
    function A() {
        this.value = 0;
    }
    A.prototype.setValue = function (newValue) {
        this.value = newValue;
    };
    A.prototype.test = function () {
        if (this.value !== 0)
            throw 'Error';
        this.setValue(1);
        if (this.value == 1)
            console.log('Value did change');
    };
    return A;
}());

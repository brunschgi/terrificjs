if (typeof define === 'function' && define.amd) {
    define(['jquery'], function() {
        return Tc;
    });
} else {
    root.Tc = Tc;
}

}).call(this);
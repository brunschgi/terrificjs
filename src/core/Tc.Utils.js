/*
 * Contains utility functions for several tasks.
 */
Tc.Utils = {};

// Helpers

// Object.keys is native in JavaScript 1.8.5
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [], k;
        for (k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}
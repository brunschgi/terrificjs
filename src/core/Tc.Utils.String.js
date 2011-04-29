/**
 * Contains utility functions for string concerning tasks.
 *
 * @author Remo Brunschwiler
 * @namespace Tc.Utils
 * @class String
 * @static
 */
(function($) {
    Tc.Utils.String = {
        /**
         * Capitalizes the first letter of the given string.
         *
         * @method capitalize
         * @param {String} str the original string
         * @return {String} the capitalized string
         */
        capitalize: function(str) {
            // capitalize the first letter
            return str.substr(0, 1).toUpperCase().concat(str.substr(1));
        }
    };   
})(Tc.$);


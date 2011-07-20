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
         * @param {String} str The original string
         * @return {String} The capitalized string
         */
        capitalize: function(str) {
            // Capitalize the first letter
            return str.substr(0, 1).toUpperCase().concat(str.substr(1));
        }
    };   
})(Tc.$);


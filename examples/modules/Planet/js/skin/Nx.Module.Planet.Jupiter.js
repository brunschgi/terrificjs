(function($) {
    /**
     * Earth Skin implementation for module Planet.
     *
     * @author Your Name
     * @namespace Tc.Module.Planet
     * @class Earth
     * @extends Tc.Module
     * @constructor
     */
    Tc.Module.Planet.Earth = function(parent) {
        /** 
         * override the appropriate methods from the decorated module (ie. this.get = function()).
         * the former/original method may be called via parent.<method>()
         */
        this.dependencies = function() {
            // calling parent method
            parent.dependencies();
        };
        
        this.beforeBinding = function(callback) {
            // calling parent method
            parent.beforeBinding(function() {
                callback();
            });
        };
        
        this.onBinding = function() {
            // calling parent method
            parent.onBinding();
        };
        
        this.afterBinding = function() {
            // calling parent method
            parent.afterBinding();
        };
    };
})(Tc.$);

(function($) {
    "use strict";

    /**
     * Base class for the different connectors.
     *
     * @author Remo Brunschwiler
     * @namespace Tc
     * @class Connector
     */
    Tc.Connector = Class.extend({

        /**
         * Initializes the Connector.
         *
         * @method init
         * @return {void}
         * @constructor
         * @param {String} connectorId
         *      The unique connector ID
         */
        init : function(connectorId) {
            this.connectorId = connectorId;
            this.components = {};
        },

        /**
         * Registers a component.
         *
         * @method registerComponent
         * @param {Module} component 
         *      The module to register
         * @param {String} role 
         *      The role of the module (e.g. master, slave etc.)
         * @return {void}
         */
        registerComponent: function(component, role) {
            role = role || 'standard';

            this.components[component.id] = {
                'component': component,
                'role': role
            };
        },

        /**
         * Unregisters a component.
         *
         * @method unregisterComponent
         * @param {Module} component 
         *      The module to unregister
         * @return {void}
         */
        unregisterComponent: function(component) {
            var components = this.components;

            if(components[component.id]) {
                delete components[component.id];
            }
        },

        /**
         * Notifies all registered components about a state change 
         * This can be be overriden in the specific connectors.
         *
         * @method notify
         * @param {Module} origin
         *      The module that sends the state change
         * @param {String} state 
         *      The component's state
         * @param {Object} data 
         *      Contains the state relevant data (if any)
         * @param {Function} callback 
         *      The callback function, it can be executed after an asynchronous
         *      action.
         * @return {boolean} 
         *      Indicates whether the default action should be excuted or not
         */
        notify: function(origin, state, data, callback) {
            /**
             * Gives the components the ability to prevent the default- and
             * after action from the events by returning false in the
             * on {Event}-Handler.
             */
            var proceed = true,
                components = this.components;

            for (var id in components) {
                if(components.hasOwnProperty(id)) {
                    var component = components[id].component;
                    if (component !== origin && component[state]) {
                        if (component[state](data, callback) === false) {
                            proceed = false;
                        }
                    }
                }
            }

            return proceed;
        }
    });
})(Tc.$);


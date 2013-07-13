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
     * @constructor
     * @param {String} connectorId
     *      The unique connector ID
     */
    init: function (connectorId) {
        this.connectorId = connectorId;
        this.components = {};
    },

    /**
     * Registers a component.
     *
     * @method registerComponent
     * @param {Module} component
     *      The module to register
     */
    registerComponent: function (component) {
        this.components[component.id] = {
            'component': component
        };
    },

    /**
     * Unregisters a component.
     *
     * @method unregisterComponent
     * @param {Module} component
     *      The module to unregister
     */
    unregisterComponent: function (component) {
        var components = this.components;

        if (components[component.id]) {
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
     * @return {boolean}
     *      Indicates whether the default action should be excuted or not
     */
    notify: function (origin, state, data, callback) {
        /*
         * Gives the components the ability to prevent the default- and
         * after action from the events by returning false in the
         * on {Event}-Handler.
         */
        var proceed = true,
            components = this.components;

        for (var id in components) {
            if (components.hasOwnProperty(id)) {
                var component = components[id].component;
                if (component !== origin && component[state]) {
                    if (component[state](data) === false) {
                        proceed = false;
                    }
                }
            }
        }

        return proceed;
    }
});


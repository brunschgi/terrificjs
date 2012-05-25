(function($) {
    "use strict";

    /**
     * Base class for the different modules.
     *
     * @author Remo Brunschwiler
     * @namespace Tc
     * @class Module
     */
    Tc.Module = Class.extend({

        /**
         * Initializes the Module.
         *
         * @method init
         * @return {void}
         * @constructor
         * @param {jQuery} $ctx 
         *      The jQuery context
         * @param {Sandbox} sandbox 
         *      The sandbox to get the resources from
         * @param {String} id
         *      The Unique module ID
         */
        init: function($ctx, sandbox, id) {
            /**
             * Contains the module context.
             *
             * @property $ctx
             * @type jQuery
             */
            this.$ctx = $ctx;

            /**
             * Contains the unique module ID.
             *
             * @property id
             * @type String
             */
            this.id = id;

            /**
             * Contains the attached connectors.
             *
             * @property connectors
             * @type Object
             */
            this.connectors = {};

            /**
             * The sandbox to get the resources from.
             *
             * @property sandbox
             * @type Sandbox
             */
            this.sandbox = sandbox;
        },

        /**
         * Template method to start (i.e. init) the module.
         * This method provides hook functions which can be overridden
         * by the individual instance.
         *
         * @method start
         * @return {void}
         */
        start: function() {
            var that = this;

            // Call the hook method from the individual instance and provide the appropriate callback
            if (this.on) {
                this.on(function() {
                    that.initAfter();
                });
            }
        },

        /**
         * Template method to stop the module.
         *
         * @method stop
         * @return {void}
         */
        stop: function() {
            var $ctx = this.$ctx;
            
            // Remove all bound events and associated jQuery data
            $('*', $ctx).unbind().removeData();
            $ctx.unbind().removeData();
        },


        /**
         * Initialization callback.
         *
         * @method initAfter
         * @return {void}
         */
        initAfter: function() {
            var that = this;

            this.sandbox.ready(function() {
                /**
                 * Call the 'after' hook method  from the individual instance
                 */
                if (that.after) {
                    that.after();
                }
            });
        },

        /**
         * Notifies all attached connectors about changes.
         *
         * @method fire
         * @param {String} state 
         *      The new state
         * @param {Object} data 
         *      The data to provide to your connected modules
         * @param {Function} defaultAction 
         *      The default action to perform
         * @return {void}
         */
        fire: function(state, data, defaultAction) {
            var that = this,
                connectors = this.connectors;

            data = data ||{};
            state = Tc.Utils.String.capitalize(state);

            for (var connectorId in connectors) {
                if(connectors.hasOwnProperty(connectorId)) {
                    var connector = connectors[connectorId];

                    // Callback combining the defaultAction and the afterAction
                    var callback = function() {
                        if (typeof defaultAction == 'function') {
                            defaultAction();
                        }
                        connector.notify(that, 'after' + state, data);
                    };

                    if (connector.notify(that, 'on' + state, data, callback)) {
                        callback();
                    }
                }
            }

            if ($.isEmptyObject(connectors)) {
                if (typeof defaultAction == 'function') {
                    defaultAction();
                }
            }
        },

        /**
         * Attaches a connector (observer).
         *
         * @method attachConnector
         * @param {Connector} connector 
         *      The connector to attach
         * @return {void}
         */
        attachConnector: function(connector) {
            this.connectors[connector.connectorId] = connector;
        },

        /**
         * Detaches a connector (observer).
         *
         * @method detachConnector
         * @param {Connector} connector
         *      The connector to detach
         * @return {void}
         */
        detachConnector: function(connector) {
            delete this.connectors[connector.connectorId];
        },

        /**
         * Decorates itself with the given skin.
         *
         * @method getDecoratedModule
         * @param {String} module 
         *      The name of the module
         * @param {String} skin 
         *      The name of the skin
         * @return {Module} 
         *      The decorated module
         */
        getDecoratedModule: function(module, skin) {
            if (Tc.Module[module][skin]) {
                var decorator = Tc.Module[module][skin];

                /*
                 * Sets the prototype object to the module.
                 * So the "non-decorated" functions will be called on the module
                 * without implementing the whole module interface.
                 */
                decorator.prototype = this;
                decorator.prototype.constructor = Tc.Module[module][skin];

                return new decorator(this);
            }

            return null;
        }
    });
})(Tc.$);


(function($) {
    "use strict";

    /**
     * The sandbox is used as a central point to get resources from, grant
     * permissions, etc.  It is shared between all modules.
     *
     * @author Remo Brunschwiler
     * @namespace Tc
     * @class Sandbox
     */
    Tc.Sandbox = Class.extend({

        /**
         * Initializes the Sandbox.
         *
         * @method init
         * @constructor
         * @param {Applicaton} application
         *      The application reference
         * @param {Object} config
         *      The configuration
         */
        init : function(application, config) {

            /**
             * The application
             *
             * @property application
             * @type Application
             */
            this.application = application;

            /**
             * The configuration.
             *
             * @property config
             * @type Object
             */
            this.config = config;

            /**
             * Contains the 'after' hook module callbacks.
             *
             * @property afterCallbacks
             * @type Array
             */
            this.afterCallbacks = [];
        },

        /**
         * Adds (register and start) all modules in the given context scope.
         *
         * @method addModules
         * @param {jQuery} $ctx
         *      The jQuery context
         * @return {Array}
         *      A list containing the references of the registered modules
         */
        addModules: function($ctx) {
            var modules = [],
                application = this.application;

            if ($ctx) {
                // Register modules
                modules = application.registerModules($ctx);

                // Start modules
                application.start(modules);
            }

            return modules;
        },

        /**
         * Removes a module by module instances.
         * This stops and unregisters a module through a module instance.
         *
         * @method removeModules
         * @param {Array} modules
         *      A list containing the module instances to remove
         */
        removeModules: function(modules) {
            var self = this,
                application = this.application;

            if (!$.isArray(modules)) {
                var $ctx = modules;

                // get modules
                var tmpModules = [];

                $ctx.find('.mod').add($ctx).each(function() {
                    // check for instance
                    var id = $(this).data('id');

                    if (id !== undefined) {
                        module = self.getModuleById(id);

                        if(module) {
                            tmpModules.push(module);
                        }
                    }
                });

                modules = tmpModules;
            }

            if(modules) {
                // Stop modules
                application.stop(modules);

                // Unregister modules
                application.unregisterModules(modules);
            }
        },

        /**
         * Subscribes a module to a connector.
         *
         * @method subscribe
         * @param {String} connector The full connector name (e.g. MasterSlave-Navigation)
         * @param {Module} module The module instance
         */
        subscribe: function(connector, module) {
            var application = this.application;

            if(module instanceof Tc.Module && connector) {
                // explicitly cast connector to string
                connector = connector + '';
                application.registerConnection(connector, module);
            }
        },

        /**
         * Unsubscribes a module from a connector.
         *
         * @method unsubscribe
         * @param {String} connectorId The connector channel id (e.g. 2 or Navigation)
         * @param {Module} module The module instance
         */
        unsubscribe: function(connectorId, module) {
            var application = this.application;

            if(module instanceof Tc.Module && connectorId) {
                // explicitly cast connector id to string
                connectorId = connectorId + '';
                application.unregisterConnection(connectorId, module);
            }
        },

        /**
         * Gets the appropriate module for the given ID.
         *
         * @method getModuleById
         * @param {int} id
         *      The module ID
         * @return {Module}
         *      The appropriate module
         */
        getModuleById: function(id) {
            var application = this.application;

            if (application.modules[id] !== undefined) {
                return application.modules[id];
            }
            else {
                throw new Error('the module with the id ' + id +
                                ' does not exist');
            }
        },

        /**
         * Gets the application config.
         *
         * @method getConfig
         * @return {Object}
         *      The configuration object
         */
        getConfig: function() {
            return this.config;
        },

        /**
         * Gets an application config param.
         *
         * @method getConfigParam
         * @param {String} name
         *      The param name
         * @return {mixed}
         *      The appropriate configuration param
         */
        getConfigParam: function(name) {
            var config = this.config;

            if (config[name] !== undefined) {
                return config[name];
            }
            else {
                throw new Error('the config param ' + name + ' does not exist');
            }
        },

        /**
         * Collects the module status messages and handles the callbacks.
         * This means that it is ready for the 'after' hook.
         *
         * @method ready
         * @param {Function} callback
         *      The 'after' hook module callback
         */
        ready: function(callback) {
            var afterCallbacks = this.afterCallbacks;

            // Add the callback to the stack
            afterCallbacks.push(callback);

            // Check whether all modules are ready for the 'after' hook
            if (this.application.modules.length === afterCallbacks.length) {
                for (var i = 0; i < afterCallbacks.length; i++) {
                    var afterCallback = afterCallbacks[i];

                    if(typeof afterCallback === "function") {
                        // make sure the callback is only executed once (and is not called during addModules)
                        delete afterCallbacks[i];
                        afterCallback();
                    }
                }
            }
        }
    });
})(Tc.$);


(function($) {
    "use strict";

    /**
     * Responsible for application-wide issues such as the creation of modules.
     *
     * @author Remo Brunschwiler
     * @namespace Tc
     * @class Application
     */
    Tc.Application = Class.extend({

        /**
         * Initializes the application.
         *
         * @method init
         * @return {void}
         * @constructor
         * @param {jQuery} $ctx 
         *      The jquery context
         * @param {Object} config 
         *      The configuration
         */
        init: function($ctx, config) {
            /**
             * The configuration.
             *
             * @property config
             * @type Object
             */
            this.config = $.extend(Tc.Config, config);

            /**
             * The jQuery context.
             *
             * @property $ctx
             * @type jQuery
             */
            this.$ctx = $ctx || $('body');

            /**
             * Contains references to all modules on the page. This can, for
             * example, be useful when there are interactions between Flash
             * objects and Javascript.
             *
             * @property modules
             * @type Array
             */
            this.modules = [];

            /**
             * Contains references to all connectors on the page.
             *
             * @property connectors
             * @type Object
             */
            this.connectors = {};

            /**
             * Contains references to all wildcard components on the page.
             *
             * @property wildcardComponents
             * @type Array
             */
            this.wildcardComponents = [];

            /**
             * The sandbox to get the resources from 
             * This sandbox is shared between all modules.
             *
             * @property sandbox
             * @type Sandbox
             */
            this.sandbox = new Tc.Sandbox(this, this.config);
        },

        /**
         * Register modules withing scope
         * Automatically registers all modules within the scope, 
         * as long as the modules use the OOCSS naming conventions.
         *
         * @method registerModules
         * @param {jQuery} $ctx 
         *      The jQuery context.
         * @return {Array} 
         *      A list containing the references of the registered modules.
         */
        registerModules : function($ctx) {
            var that = this,
                modules = [];

            $ctx = $ctx || this.$ctx;

            $ctx.find('.mod').each(function() {
                var $this = $(this);

                /**
                 * Indicates that it is a base module, this is the default and
                 * no JavaScript needs to be involved. It must occur excactly
                 * once.
                 * @config .mod 
                 */

                /**
                 * Indicates that it is a module of type basic, which is
                 * derived from the base module. It can occur at most
                 * once. Example: .modBasic
                 * @config .mod{moduleName}
                 */

                /**
                 * Indicates that the module basic has the submarine skin. It
                 * will be decorated by the skin JS (if it exists). It can occur
                 * arbitrarily. Example: .skinBasicSubmarine
                 * @config .skin{moduleName}{skinName} 
                 */

                /** 
                 * A module can have a comma-separated list of data connectors.
                 * The list contains the IDs of the connectors in the following
                 * schema: {connectorName}{connectorId}{connectorRole}
                 * 
                 * The example MasterSlave1Master decodes to: name = 
                 * MasterSlave, id = 1, role = Master. This indicates that the
                 * module should notify the MasterSlave connector (the mediator)
                 * on all state changes. The connector id is used to chain the
                 * appropriate modules together and to improve the
                 * reusability of the connector. It can contain multiple
                 * connector ids (e.g. 1,2,MasterSlave1Master). 
                 *
                 * @config data-connectors
                 */

                var classes = $this.attr('class').split(' '),
                    data_connectors;

                if (classes.length > 1) {
                    var modName,
                        skins = [],
                        connectors = [];

                    for (var i = 0, len = classes.length; i < len; i++) {
                        var part = $.trim(classes[i]);

                        if (part.indexOf('mod') === 0 && part.length > 3) {
                            modName = part.substr(3);
                        }
                        else if (part.indexOf('skin') === 0) {
                            // Remove the mod name part from the skin name
                            skins.push(part.substr(4).replace(modName, ''));
                        }
                    }

                    data_connectors = $.data($this, 'tc-connectors');

                    if (data_connectors) {
                        connectors = data_connectors.split(',');
                        for (var i = 0, len = connectors.length; i < len; i++) {
                            var connector = $.trim(connectors[i]);
                            if(connector) {
                                connectors[i] = connector;
                            }
                        }
                    }

                    if (modName && Tc.Module[modName]) {
                        modules.push(that.registerModule($this, modName, skins, connectors));
                    }
                }
            });

            return modules;
        },

        /**
         * Unregisters the modules given by the module instances.
         *
         * @method unregisterModule
         * @param {Array} modules 
         *      A list containting the module instances to unregister
         * @return {void}
         */
        unregisterModules : function(modules) {
            var connectors = this.connectors,
                wildcardComponents = this.wildcardComponents;

            modules = modules || this.modules;

            if (modules === this.modules) {
                // Empty everything if the arrays are equal
                this.wildcardComponents = [];
                this.connectors = [];
                this.modules = [];
            }
            else {
                // Unregister the given modules
                for (var i = 0, len = modules.length; i < len; i++) {
                    var module = modules[i];
                    var index;

                    // Delete the references in the connectors
                    for (var connectorId in connectors) {
                        if (connectors.hasOwnProperty(connectorId)) {
                            connectors[connectorId].unregisterComponent(module);
                        }
                    }

                    // Delete the references in the wildcard components
                    index = $.inArray(module, wildcardComponents);
                    if(index > -1) {
                        delete wildcardComponents[index];
                    }

                    // Delete the module instance itself
                    index = $.inArray(module, this.modules);
                    if(index > -1) {
                        delete this.modules[index];
                    }
                }
            }
        },

        /**
         * Starts (intializes) the registered modules.
         *
         * @method start
         * @param {Array} modules 
         *      A list of the modules to start
         * @return {void}
         */
        start: function(modules) {
            var wildcardComponents = this.wildcardComponents,
                connectors = this.connectors;

            modules = modules || this.modules;

            // Start the modules
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].start();
            }

            /*
             * Special treatment for the wildcard connection (conn*) -> it will
             * be notified about all state changes from all connections and is
             * able to propagate its changes to all modules. This must be done on
             * init to make sure that all connectors on the page has been
             * instantiated. Only do this for the given modules.
             */
            for (var i = 0, len = wildcardComponents.length; i < len; i++) {
                var component = wildcardComponents[i];
                if ($.inArray(component, modules) > -1) {
                    for (var connectorId in connectors) {
                        if (connectors.hasOwnProperty(connectorId)) {
                            // The connector observes the component and attaches it as an observer
                            component.attachConnector(connectors[connectorId]);
                            connectors[connectorId].registerComponent(component, '*');
                        }
                    }
                }
            }
        },

        /**
         * Stops the registered modules.
         *
         * @method stop
         * @param {Array} modules 
         *      A list containting the module instances to stop.
         * @return {void}
         */
        stop: function(modules) {
            modules = modules || this.modules;

            // Stop the modules
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].stop();
            }
        },

        /**
         * Registers a module.
         *
         * @method registerModule
         * @param {jQuery} $node 
         *      The module node.
         * @param {String} modName 
         *      The module name. It must match the class name of the module
         *      (case sensitive).
         * @param {Array} skins 
         *      A list of skin names. Each entry must match a class name of a
         *      skin (case sensitive).
         * @param {Array} connectors 
         *      A list of connectors identifiers (e.g. MasterSlave1Master).
         *      Schema: {connectorName}{connectorId}{connectorRole}
         * @return {Module} 
         *      The reference to the registered module.
         */
        registerModule : function($node, modName, skins, connectors) {
            var modules = this.modules;

            modName = modName || null;
            skins = skins || [];
            connectors = connectors || [];

            if (modName && Tc.Module[modName]) {
                // Generate a unique ID for every module
                var modId = modules.length;
                $.data($node[0], 'tc-id', modId);

                modules[modId] = new Tc.Module[modName]($node, this.sandbox, modId);

                for (var i = 0, len = skins.length; i < len; i++) {
                    var skinName = skins[i];

                    if (Tc.Module[modName][skinName]) {
                        modules[modId] = modules[modId].getDecoratedModule(modName, skinName);
                    }
                }

                for (var i = 0, len = connectors.length; i < len; i++) {
                    this.registerConnection(connectors[i], modules[modId]);
                }

                return modules[modId];
            }

            return null;
        },

        /**
         * Registers a connection between a module and a connector.
         *
         * @method registerConnection
         * @param {String} connector 
         *      The full connector name (e.g. MasterSlave1Slave).
         * @param {Module} component 
         *      The module instance.
         * @return {void}
         */
        registerConnection : function(connector, component) {
            var connectorType = connector.replace(/[0-9]+[a-zA-Z]*$/, ''),
                connectorId = connector.replace(/[a-zA-Z]*$/, '').replace(/^[a-zA-Z]*/, ''),
                connectorRole = connector.replace(/^[a-zA-Z]*[0-9]*/, '');

            if(connectorId) {
                if (connectorId === '*' && connectorRole === '*') {
                    // Add the component to the wildcard component stack
                    this.wildcardComponents.push(component);
                }
                else {
                    var connectors = this.connectors;

                    if (!connectors[connectorId]) {
                        // Instantiate the appropriate connector if it does not
                // exist yet
                        if (connectorType === '') {
                            connectors[connectorId] = new Tc.Connector(connectorId);
                        }
                        else if (Tc.Connector[connectorType]) {
                            connectors[connectorId] = new Tc.Connector[connectorType](connectorId);
                        }
                    }

                    if (connectors[connectorId]) {
                        /**
                         * The connector observes the component and attaches it as
                         * an observer.
                         */
                        component.attachConnector(connectors[connectorId]);

                        /**
                         * The component wants to be informed over state changes.
                         * It registers it as connector member.
                         */
                        connectors[connectorId].registerComponent(component, connectorRole);
                    }
                }
            }
        },

        /**
         * Unregisters a module from a connector.
         *
         * @method unregisterConnection
         * @param {int} connectorId
         *      The connector channel id (e.g. 2).
         * @param {Module} component
         *      The module instance.
         * @return {void}
         */
        unregisterConnection : function(connectorId, component) {
            var wildcardComponents = this.wildcardComponents,
                connectors = this.connectors,
                connector = connectors[connectorId];

            // Delete the references in the connector and the module
            if (connector) {
                connector.unregisterComponent(component);
                component.detachConnector(connector);
            }

            // Delete the references in the wildcard components
            var index = $.inArray(component, wildcardComponents);
            if(index > -1) {
                delete wildcardComponents[index];
            }
        }
    });
})(Tc.$);


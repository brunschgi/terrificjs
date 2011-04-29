(function($) {
    /**
     * Responsible for application wide issues (ie. the creation of modules).
     *
     * @author Remo Brunschwiler
     * @namespace Tc
     * @class Application
     */
    Tc.Application = Class.extend({

        /**
         * Initializes the Application.
         *
         * @method init
         * @return {void}
         * @constructor
         * @param {jQuery} $ctx the jquery context
         * @param {Object} config the configuration
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
             * The jquery context.
             *
             * @property $ctx
             * @type jQuery
             */
            this.$ctx = $ctx || $('body');

            /**
             * Contains references to all modules on the page.
             * -> could be useful ie. when there are interactions between flash <-> js.
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
             * Contains references to all wilcard components on the page.
             *
             * @property wildcardComponents
             * @type Array
             */
            this.wildcardComponents = [];

            /**
             * The sandbox to get the resources from (shared between all modules).
             *
             * @property sandbox
             * @type Sandbox
             */
            this.sandbox = new Tc.Sandbox(this, this.config);
        },

        /**
         * Registers all modules in the context scope automatically (as long as the modules uses the oocss naming conventions).
         *
         * @method registerModules
         * @param {jQuery} $ctx the jquery context.
         * @return {Array} a list containing the references of the registered modules.
         */
        registerModules : function($ctx) {
            var that = this,
                    modules = [];

            $ctx = $ctx || this.$ctx;

            $('.mod:not([data-lazyinit=true]):not(.mod[data-lazyinit=true] .mod)', $ctx).each(function() {
                var $this = $(this);

                /*
                 * a module can have 3 types of classes:
                 * 1. .mod -> indicates that it is a base module (default -> no javascript need to be involved)
                 * 2. .mod<moduleName> (ie. .modBasic) -> indicates that it is a module from the type basic (derived from the base module)
                 * 3. .skin<moduleName><skinName> (ie. .skinBasicSubmarine) -> indicates that the module basic has the submarine skin. it will be decorated by the skin js (if existing).
                 *
                 * type 1 must occur exactly once
                 * type 2 can occur at most once
                 * type 3 can occur arbitrarily
                 *
                 * additionaly a module can have 1 type of data attributes:
                 * 1. data-connectors -> a comma separated value containing the connector ids -> schema of a connector id: <connectorName><connectorId><connectorRole>
                 *    (ie. MasterSlave1Master -> name = MasterSlave, id = 1, role = Master)
                 * 	-> indicates that the module should notify the MasterSlave connector (mediator) over all state changes
                 * 	-> the connector id is used to chain the appropriate modules together and to improve the reusability of the connector
                 *
                 * type 1 can contain multiple connector ids (ie. 1,2,MasterSlave1Master)
                 */

                var classes = $this.attr('class').split(' ');

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
                            // remove the mod name part from the skin name
                            skins.push(part.substr(4).replace(modName, ''));
                        }
                    }


                    if ($this.attr('data-connectors')) {
                        connectors = $this.attr('data-connectors').split(',');
                        for (var i = 0, len = connectors.length; i < len; i++) {
                            connectors[i] = $.trim(connectors[i]);
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
         * Unregisters the modules by the given module instances.
         *
         * @method registerModules
         * @param {Array} modules a list containting the module instances to unregister.
         * @return {void}
         */
        unregisterModules : function(modules) {
            var connectors = this.connectors,
                    wildcardComponents = this.wildcardComponents;

            modules = modules || this.modules;

            if (modules === this.modules) {
                // empy everything if the arrays are equal
                this.wildcardComponents = [];
                this.connectors = [];
                this.modules = [];
            }
            else {
                // unregister the given modules
                for (var i = 0, len = modules.length; i < len; i++) {
                    var module = modules[i];
                    var index;

                    // delete the references in the connectors
                    for (var connId in connectors) {
                        connectors[connId].unregisterComponent(module);
                    }

                    // delete the references in the wildcard components
                    index = $.inArray(module, wildcardComponents);
                    delete wildcardComponents[index];

                    // delete the module instance itself
                    index = $.inArray(module, this.modules);
                    delete this.modules[index];
                }
            }
        },

        /**
         * Starts (intializes) the registered modules.
         *
         * @method start
         * @param {Array} modules a list of the modules to start.
         * @return {void}
         */
        start: function(modules) {
            var wildcardComponents = this.wildcardComponents,
                    connectors = this.connectors;

            modules = modules || this.modules;

            // start the modules
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].start();
            }

            /*
             * special treatment for the wildcard connection (conn*) -> it will be notified about
             * all state changes from all connections and is able to propagate its changes to all modules.
             * this must be done on init to make sure that all connectors on the page has been instantiated.
             * only do this for the given modules.
             */
            for (var i = 0, len = wildcardComponents.length; i < len; i++) {
                var component = wildcardComponents[i];
                if ($.inArray(component, modules) > -1) {
                    for (var connectorId in connectors) {
                        // the connector observes the component -> attach it as observer
                        component.attachConnector(connectors[connectorId]);
                        connectors[connectorId].registerComponent(component, '*');
                    }
                }
            }
        },

        /**
         * Stops the registered modules.
         *
         * @method stop
         * @param {Array} modules a list containting the module instances to stop.
         * @return {void}
         */
        stop: function(modules) {
            modules = modules || this.modules;

            // stop the modules
            for (var i = 0, len = modules.length; i < len; i++) {
                modules[i].stop();
            }
        },

        /**
         * Registers a module.
         *
         * @method registerModule
         * @param {jQuery} $node the module node.
         * @param {String} modName the module name. it must match the class name of the module (case sensitive).
         * @param {Array} skins a list of skin names. each entry must match a class name of a skin (case sensitive)).
         * @param {Array} connectors a list of connectors identifiers. schema: <connectorName><connectorId><connectorRole> (ie. MasterSlave1Master).
         * @return {Module} the reference to the registered module.
         */
        registerModule : function($node, modName, skins, connectors) {
            var modules = this.modules;

            modName = modName || null;
            skins = skins || [];
            connectors = connectors || [];

            if (modName && Tc.Module[modName]) {
                // generate a unique id for every module
                var modId = modules.length;
                $node.data('id', modId);

                $.log.debug('instantiate Tc.Module.' + modName);
                modules[modId] = new Tc.Module[modName]($node, this.sandbox, modId);

                for (var i = 0, len = skins.length; i < len; i++) {
                    var skinName = skins[i];

                    if (Tc.Module[modName][skinName]) {
                        $.log.debug('decorate it with the skin Tc.Module.' + modName + '.' + skinName);
                        modules[modId] = modules[modId].getDecoratedModule(modName, skinName);
                    }
                }

                for (var i = 0, len = connectors.length; i < len; i++) {
                    this.registerConnection(connectors[i], modules[modId]);
                }

                return modules[modId];
            }
            else {
                $.log.info('the module Tc.Module.' + modName + ' does not exist');
                return null;
            }
        },

        /**
         * Registers a connection between a module and a connector.
         *
         * @method registerConnection
         * @param {String} connector the full connector name (ie. MasterSlave1Slave).
         * @param {Module} component the module instance.
         * @return {void}
         */
        registerConnection : function(connector, component) {
            var connectorType = connector.replace(/[0-9]+[a-zA-Z]*$/, ''),
                    connectorId = connector.replace(/[a-zA-Z]*$/, '').replace(/^[a-zA-Z]*/, ''),
                    connectorRole = connector.replace(/^[a-zA-Z]*[0-9]*/, '');

            if (connectorId === '*' && connectorRole === '*') {
                // add the component to the wildcard component stack
                this.wildcardComponents.push(component);
            }
            else {
                var connectors = this.connectors;

                if (!connectors[connectorId]) {
                    // instantiate the appropriate connector if it does not exist yet
                    if (connectorType === '') {
                        connectors[connectorId] = new Tc.Connector(connectorId);
                    }
                    else if (Tc.Connector[connectorType]) {
                        connectors[connectorId] = new Tc.Connector[connectorType](connectorId);
                    }
                }

                if (connectors[connectorId]) {
                    $.log.debug('attach the connector: ' + connectorId);

                    // the connector observes the component -> attach it as observer
                    component.attachConnector(connectors[connectorId]);

                    // the component wants to be informed over state changes -> register it as connector member
                    connectors[connectorId].registerComponent(component, connectorRole);
                }
            }
        }
    });
})(Tc.$);

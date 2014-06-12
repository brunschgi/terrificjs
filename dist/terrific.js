/**
 * Terrific JavaScript Framework v2.1.0
 * http://terrifically.org
 *
 * Copyright 2014, Remo Brunschwiler
 * @license MIT Licensed.
 *
 * Date: Thu Jun 12 2014 15:18:26
 *
 *
 * Includes:
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 * @module Tc
 *
 */
(function(){

    var root = this, // save a reference to the global object
        Tc,
        $;

    if (typeof exports !== 'undefined') {
        Tc = exports;
    } else {
        Tc = root.Tc = {};
    }

    /*
     * The base library object.
     */
    $ = Tc.$ = root.jQuery || root.Zepto || root.$;

/*
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
/* jshint ignore:start */
(function(){
    var initializing = false,
		fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){
    };

    // Create a new Class that inherits from this class
    Class.extend = function(prop){
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" &&
            fnTest.test(prop[name]) ? (function(name, fn){
                return function(){
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name]) : prop[name];
        }

        // The dummy class constructor
        function Class(){
            // All construction is actually done in the init method
            if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();
/* jshint ignore:end */


/**
 * Contains the application base config.
 * The base config can be extended or overwritten either via
 * new Application ($ctx, config) during bootstrapping the application or via
 * overriding the Tc.Config object in your project.
 *
 * @author Remo Brunschwiler
 * @namespace Tc
 * @class Config
 * @static
 */
Tc.Config = {
    /**
     * The paths for the different types of dependencies.
     *
     * @property dependencies
     * @type Object
     */
    dependencies: {
        css: '/css/dependencies',
        js: '/js/dependencies'
    }
};


/**
 * Responsible for application-wide issues such as the creation of modules and establishing connections between them.
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
     * @constructor
     * @param {jQuery} $ctx
     *      The jQuery context
     * @param {Object} config
     *      The configuration
     */
    init: function ($ctx, config) {
        /**
         * The configuration.
         *
         * @property config
         * @type Object
         */
        this.config = $.extend({}, Tc.Config, config);

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
     *      The jQuery context
     * @return {Array}
     *      A list containing the references of the registered modules
     */
    registerModules: function ($ctx) {
        var self = this,
            modules = [],
            stringUtils = Tc.Utils.String;

        $ctx = $ctx || this.$ctx;

        $ctx.find('.mod:not([data-ignore="true"])').add($ctx).each(function () {
            var $this = $(this),
                classes = $this.attr('class') || '';

            classes = classes.split(' ');

            /*
             * A module can have several different classes and data attributes.
             * See below for possible values.
             */

            /*
             * @config .mod
             *
             * Indicates that it is a base module, this is the default and
             * no JavaScript needs to be involved. It must occur excactly
             * once.
             */

            /*
             * @config .mod{moduleName} || .mod-{module-name}
             *
             * Indicates that it is a module of type basic, which is
             * derived from the base module. It can occur at most
             * once. Example: .modBasic || .mod-basic
             */

            /*
             * @config .skin{moduleName}{skinName} || .skin-{module-name}-{skin-name}
             *
             * Indicates that the module basic has the submarine skin. It
             * will be decorated by the skin JS (if it exists). It can occur
             * arbitrarily. Example: .skinBasicSubmarine || .skin-basic-submarine
             */

            /*
             * @config data-connectors
             *
             * A module can have a comma-separated list of data connectors.
             * The list contains the IDs of the connectors in the following
             * schema: {connectorType}-{connectorId}
             *
             * {connectorType} is optional. If only the {connectorId} is given, the
             * default connector is instantiated.
             *
             * The example MasterSlave-Navigation decodes to: type =
             * MasterSlave, id = Navigation. This instantiates the MasterSlave
             * connector (as mediator) with the connector id Navigation.
             * The connector id is used to chain the appropriate (the ones with the same id)
             * modules together and to improve the reusability of the connector.
             * It can contain multiple connector ids (e.g. 1,2,MasterSlave-Navigation).
             */

            if (classes.length > 1) {
                var modName,
                    skins = [],
                    connectors = [],
                    dataConnectors;

                for (var i = 0, len = classes.length; i < len; i++) {
                    var part = $.trim(classes[i]);

                    // do nothing for empty parts
                    if (part) {
                        // convert to camel if necessary
                        if (part.indexOf('-') > -1) {
                            part = stringUtils.toCamel(part);
                        }

                        if (part.indexOf('mod') === 0 && part.length > 3) {
                            modName = part.substr(3);
                        }
                        else if (part.indexOf('skin') === 0) {
                            // Remove the mod name part from the skin name
                            skins.push(part.substr(4).replace(modName, ''));
                        }
                    }
                }

                /*
                 * This needs to be done via attr() instead of data().
                 * As data() cast a single number-only connector to an integer, the split will fail.
                 */
                dataConnectors = $this.attr('data-connectors');

                if (dataConnectors) {
                    connectors = dataConnectors.split(',');
                    for (var i = 0, len = connectors.length; i < len; i++) {
                        var connector = $.trim(connectors[i]);
                        // do nothing for empty connectors
                        if (connector) {
                            connectors[i] = connector;
                        }
                    }
                }

                if (modName && Tc.Module[modName]) {
                    modules.push(self.registerModule($this, modName, skins, connectors));
                }
            }
        });

        return modules;
    },

    /**
     * Unregisters the modules given by the module instances.
     *
     * @method unregisterModules
     * @param {Array} modules
     *      A list containing the module instances to unregister
     */
    unregisterModules: function (modules) {
        var connectors = this.connectors;

        modules = modules || this.modules;

        if (modules === this.modules) {
            // Clear everything if the arrays are equal
            this.connectors = [];
            this.modules = [];
        }
        else {
            // Unregister the given modules
            for (var i = 0, len = modules.length; i < len; i++) {
                var module = modules[i],
                    index;

                // Delete the references in the connectors
                for (var connectorId in connectors) {
                    if (connectors.hasOwnProperty(connectorId)) {
                        connectors[connectorId].unregisterComponent(module);
                    }
                }

                // Delete the module instance itself
                index = $.inArray(module, this.modules);
                if (index > -1) {
                    delete this.modules[index];
                }
            }
        }
    },

	/**
	 * Registers a hook that is called at the end.
	 *
	 * @method end
	 * @param {Function} hook
	 * 		The hook function to be executed
	 */
	end: function(hook) {
		if(typeof hook === 'function') {
			this.sandbox.addCallback('end', hook);
		}
	},

    /**
     * Starts (intializes) the registered modules.
     *
     * @method start
     * @param {Array} modules
     *      A list of the modules to start
     */
    start: function (modules) {
        modules = modules || this.modules;

        // Start the modules
        for (var i = 0, len = modules.length; i < len; i++) {
            modules[i].start();
        }
    },

    /**
     * Stops the registered modules.
     *
     * @method stop
     * @param {Array} modules
     *      A list containing the module instances to stop
     */
    stop: function (modules) {
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
     *      The module node
     * @param {String} modName
     *      The module name. It must match the class name of the module
     * @param {Array} skins
     *      A list of skin names. Each entry must match a class name of a skin
     * @param {Array} connectors
     *      A list of connectors identifiers (e.g. MasterSlave-Navigation)
     *      Schema: {connectorName}-{connectorId}
     * @return {Module}
     *      The reference to the registered module
     */
    registerModule: function ($node, modName, skins, connectors) {
        var modules = this.modules;

        modName = modName || undefined;
        skins = skins || [];
        connectors = connectors || [];

        if (modName && Tc.Module[modName]) {
            // Generate a unique ID for every module
            var id = modules.length;
            $node.data('terrific-id', id);

            // Instantiate module
            modules[id] = new Tc.Module[modName]($node, this.sandbox, id);

            // Decorate it
            for (var i = 0, len = skins.length; i < len; i++) {
                var skinName = skins[i];

                if (Tc.Module[modName][skinName]) {
                    modules[id] = modules[id].getDecoratedModule(modName, skinName);
                }
            }

            // Register connections
            for (var i = 0, len = connectors.length; i < len; i++) {
                this.registerConnection(connectors[i], modules[id]);
            }

            return modules[id];
        }

        return null;
    },

    /**
     * Registers a connection between a module and a connector.
     *
     * @method registerConnection
     * @param {String} connector
     *      The full connector name (e.g. MasterSlave-Navigation)
     * @param {Module} component
     *      The module instance
     */
    registerConnection: function (connector, component) {
        connector = $.trim(connector);

        var parts = connector.split('-'),
            connectorType,
            connectorId,
            identifier;

        if (parts.length === 1) {
            // default connector
            identifier = connectorId = parts[0];
        }
        else if (parts.length === 2) {
            // a specific connector type is given
            connectorType = parts[0];
            connectorId = parts[1];
            identifier = connectorType + connectorId;
        }

        if (identifier) {
            var connectors = this.connectors;

            if (!connectors[identifier]) {
                // Instantiate the appropriate connector if it does not exist yet
                if (!connectorType) {
                    connectors[identifier] = new Tc.Connector(connectorId);
                }
                else if (Tc.Connector[connectorType]) {
                    connectors[identifier] = new Tc.Connector[connectorType](connectorId);
                }
            }

            if (connectors[identifier]) {
                /*
                 * The connector observes the component and attaches it as
                 * an observer.
                 */
                component.attachConnector(connectors[identifier]);

                /*
                 * The component wants to be informed over state changes.
                 * It registers it as connector member.
                 */
                connectors[identifier].registerComponent(component);
            }
        }
    },

    /**
     * Unregisters a module from a connector.
     *
     * @method unregisterConnection
     * @param {String} connectorId
     *      The connector channel id (e.g. 2)
     * @param {Module} component
     *      The module instance
     */
    unregisterConnection: function (connectorId, component) {
        var connector = this.connectors[connectorId];

        // Delete the references in the connector and the module
        if (connector) {
            connector.unregisterComponent(component);
            component.detachConnector(connector);
        }
    }
});


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
    init: function (application, config) {

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
		 * Contains function references to registered hooks.
		 *
		 * @property hooks
		 * @type Object
		 */
		this.hooks = { after: [], end: [] };
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
    addModules: function ($ctx) {
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
     * @param {mixed} modules
     *      A list containing the module instances to remove or the jQuery context to look for registered modules in.
     */
    removeModules: function (modules) {
        var self = this,
            application = this.application;

        if (!$.isArray(modules)) {
            var $ctx = modules;

            // get modules
            var tmpModules = [];

            $ctx.find('.mod').add($ctx).each(function () {
                // check for instance
                var id = $(this).data('terrific-id');

                if (id !== undefined) {
                    var module = self.getModuleById(id);

                    if (module) {
                        tmpModules.push(module);
                    }
                }
            });

            modules = tmpModules;
        }

        if (modules) {
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
    subscribe: function (connector, module) {
        var application = this.application;

		// explicitly cast connector to string (e.g. to handle 0 case)
		connector = connector + '';

		// guards
		if(!module || !connector) {
			throw new Error('subscribe is expecting 2 parameters (connector, module)');
		}

		if(!(module instanceof Tc.Module)) {
			throw new Error('the module param must be an instance of Tc.Module');
		}

		application.registerConnection(connector, module);
    },

    /**
     * Unsubscribes a module from a connector.
     *
     * @method unsubscribe
     * @param {String} connectorId The connector channel id (e.g. 2 or Navigation)
     * @param {Module} module The module instance
     */
    unsubscribe: function (connectorId, module) {
        var application = this.application;

        if (module instanceof Tc.Module && connectorId) {
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
    getModuleById: function (id) {
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
    getConfig: function () {
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
    getConfigParam: function (name) {
        var config = this.config;

        if (config[name] !== undefined) {
            return config[name];
        }
        else {
            throw new Error('the config param ' + name + ' does not exist');
        }
    },

	/**
	 * Adds a callback to be executed in the appropriate phase.
	 *
	 * @method addCallback
	 * @param {String} phase default: end
	 * @param {Function} callback
	 */
	addCallback: function(phase, callback) {
		// validate params
		if (callback == null) {
			// only 1 param
			phase = 'end';
		}

		this.hooks[phase].push(callback);
	},

    /**
     * Collects the module status messages and handles the callbacks.
     * This means that it is ready for the 'after' hook.
     *
     * @method ready
     * @param {Function} callback
     *      The 'after' hook module callback
     */
    ready: function (callback) {
        var afterHooks = this.hooks['after'];

        // Add the callback to the stack
        afterHooks.push(callback);

        // Check whether all modules are ready for the 'after' hook
        if (this.application.modules.length === afterHooks.length) {
            for (var i = 0; i < afterHooks.length; i++) {
                var afterCallback = afterHooks[i];

                if (typeof afterCallback === "function") {
                    // make sure the callback is only executed once (and is not called during addModules)
                    delete afterHooks[i];
                    afterCallback();
                }
            }

			// execute the end hooks
			var endHooks = this.hooks['end'];
			for (var i = 0; i < endHooks.length; i++) {
				var hook = endHooks[i];
				if (typeof hook === "function") {
					hook();
				}
			}
        }
    }
});


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
     * @constructor
     * @param {jQuery} $ctx
     *      The jQuery context
     * @param {Sandbox} sandbox
     *      The sandbox to get the resources from
     * @param {String} id
     *      The Unique module ID
     */
    init: function ($ctx, sandbox, id) {
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
     */
    start: function () {
        var self = this;

        // Call the hook method from the individual instance and provide the appropriate callback
        if (this.on) {
            this.on(function () {
                self.initAfter();
            });
        }
    },

    /**
     * Template method to stop the module.
     *
     * @method stop
     */
    stop: function () {
        var $ctx = this.$ctx;

        // Remove all bound events and associated jQuery data
        $('*', $ctx).unbind().removeData();
        $ctx.unbind().removeData();
    },

    /**
     * Initialization callback.
     *
     * @method initAfter
     * @protected
     */
    initAfter: function () {
        var self = this;

        this.sandbox.ready(function () {
            /*
             * Call the 'after' hook method from the individual instance
             */
            if (self.after) {
                self.after();
            }
        });
    },

    /**
     * Notifies all attached connectors about changes.
     *
     * @method fire
     * @param {String} state The new state
     * @param {Object} data The data to provide to your connected modules (optional)
     * @param {Array} channels  A list containing the channel ids to send the event to (optional)
     * @param {Function} defaultAction The default action to perform (optional)
     */
    fire: function (state, data, channels, defaultAction) {
        var self = this,
            connectors = this.connectors,
            shouldBeCalled = true;  // indicates whether the default handler should be called

        // validate params
        if (channels == null && defaultAction == null) {
            // Max. 2 params
            if (typeof data === 'function') {
                // (state, defaultAction)
                defaultAction = data;
                data = undefined;
            }
            else if ($.isArray(data)) {
                // (state, channels)
                channels = data;
                data = undefined;
            }
        }
        else if (defaultAction == null) {
            // 2-3 params
            if (typeof channels === 'function') {
                // (state, data, defaultAction)
                defaultAction = channels;
                channels = undefined;
            }

            if ($.isArray(data)) {
                // (state, channels, defaultAction)
                channels = data;
                data = undefined;
            }
        }

        state = Tc.Utils.String.capitalize(state);
        data = data || {};
        channels = channels || Object.keys(connectors);

        for (var i = 0, len = channels.length; i < len; i++) {
            var connectorId = channels[i];
            if (connectors.hasOwnProperty(connectorId)) {
                var connector = connectors[connectorId],
                    proceed = connector.notify(self, 'on' + state, data) || false;

                if (!proceed) {
                    shouldBeCalled = false;
                }

            } else {
                throw new Error('the module #' + self.id + ' is not connected to connector ' + connectorId +
					' – hint: please make sure that your data is an object and not an array');
            }
        }

        // Execute default action unless a veto is provided
        if (shouldBeCalled) {
            if (typeof defaultAction === 'function') {
                defaultAction(data);
            }
        }
    },

    /**
     * Attaches a connector (observer).
     *
     * @method attachConnector
     * @param {Connector} connector
     *      The connector to attach
     */
    attachConnector: function (connector) {
        this.connectors[connector.connectorId] = connector;
    },

    /**
     * Detaches a connector (observer).
     *
     * @method detachConnector
     * @param {Connector} connector The connector to detach
     */
    detachConnector: function (connector) {
        delete this.connectors[connector.connectorId];
    },

    /**
     * Decorates itself with the given skin.
     *
     * @method getDecoratedModule
     * @param {String} module The name of the module
     * @param {String} skin The name of the skin
     * @return {Module} The decorated module
     */
    getDecoratedModule: function (module, skin) {
        if (Tc.Module[module][skin]) {
            var Decorator = Tc.Module[module][skin];

            /*
             * Sets the prototype object to the module.
             * So the "non-decorated" functions will be called on the module
             * without implementing the whole module interface.
             */
            Decorator.prototype = this;
            Decorator.prototype.constructor = Tc.Module[module][skin];

            return new Decorator(this);
        }

        return null;
    }
});


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
/**
 * Contains utility functions for string concerning tasks.
 *
 * @author Remo Brunschwiler
 * @namespace Tc
 * @class Utils.String
 * @static
 */
Tc.Utils.String = {
    /**
     * Capitalizes the first letter of the given string.
     *
     * @method capitalize
     * @param {String} str
     *      The original string
     * @return {String}
     *      The capitalized string
     */
    capitalize: function (str) {
        // Capitalize the first letter
        return str.substr(0, 1).toUpperCase().concat(str.substr(1));
    },

    /**
     * Camelizes the given string.
     *
     * @method toCamel
     * @param {String} str
     *      The original string
     * @return {String}
     *      The camelized string
     */
    toCamel: function (str) {
        return str.replace(/(\-[A-Za-z])/g, function ($1) {
            return $1.toUpperCase().replace('-', '');
        });
    }
};


}).call(this);
/**
 * Terrific JavaScript Framework v1.0.0
 * http://terrifically.org
 *
 * Copyright 2011, Remo Brunschwiler
 * MIT Licensed.
 *
 * Date: Thu, 04 Aug 2011 14:56:13 GMT
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
var Tc = Tc || {};

/*
 * The jQuery object.
 */
Tc.$ = jQuery.noConflict(false);

/**
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 */
(function(){
    var initializing = false, fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    
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

/**
 * Contains the application base config.
 * The base config can be extended or overwritten either via
 * new Application ($ctx, config), during bootstrapping the application or via 
 * /public/js/Tc.Config.js in the project folder.
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
     * @property dependencyPath
     * @type Object
     */
    dependencyPath: {
        library: '/js/libraries/dynamic/',
        plugin: '/js/plugins/dynamic/',
        util: '/js/utils/dynamic/'
    }
};

(function($) {
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
             * xample, be useful when there are interactions between Flash
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

            $('.mod', $ctx).each(function() {
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
                            // Remove the mod name part from the skin name
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
                    for (var connId in connectors) {
                        connectors[connId].unregisterComponent(module);
                    }

                    // Delete the references in the wildcard components
                    index = $.inArray(module, wildcardComponents);
                    delete wildcardComponents[index];

                    // Delete the module instance itself
                    index = $.inArray(module, this.modules);
                    delete this.modules[index];
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
             * able to propagate its changes to all modules. Tis must be done on
             * init to make sure that all connectors on the page has been
             * instantiated. Only do this for the given modules.
             */
            for (var i = 0, len = wildcardComponents.length; i < len; i++) {
                var component = wildcardComponents[i];
                if ($.inArray(component, modules) > -1) {
                    for (var connectorId in connectors) {
                        // The connector observes the component and attaches it
            // as an observer
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
                $node.data('id', modId);

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
    });
})(Tc.$);

(function($) {
    /**
     * The sandbox function
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
         * @return {void}
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
             * Contains the requested javascript dependencies.
             *
             * @property dependencies
             * @type Array
             */
            this.dependencies = [];

            /**
             * Contains the afterBinding module callbacks.
             *
             * @property afterBindingCallbacks
             * @type Array
             */
            this.afterBindingCallbacks = [];


            /**
             * Contains the first script node on the page.
             *
             * @property firstScript
             * @type Node
             */
            this.firstScript = $('script').get(0);
        },

        /**
         * Adds (register and start) all modules in the given context scope.
         *
         * @method addModules
         * @param {jQuery} $ctx 
         *      The jQuery context.
         * @return {Array} 
         *      A list containing the references of the registered modules.
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
         *      A list containting the module instances to remove.
         * @return {void}
         */
        removeModules: function(modules) {
            var application = this.application;

            if (modules) {
                // Stop modules
                application.stop(modules);

                // Unregister modules
                application.unregisterModules(modules);
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

            if (config.name !== undefined) {
                return config.name;
            }
            else {
                throw new Error('the config param ' + name + ' does not exist');
            }
        },

        /**
         * Loads a requested dependency (if not already loaded).
         *
         * @method loadDependency
         * @param {String} dependency 
         *      The dependency (e.g. swfobject.js)
         * @param {String} type 
         *      The dependency type (plugin | library | util | url)
         * @param {Function} callback 
         *      The callback to execute after the dependency has successfully
         *      loaded.
         * @param {String} phase 
         *      The module phase where the dependency is needed
         *      (e.g. beforeBinding, onBinding).
         * @return {void}
         */
        loadDependency: function(dependency, type, callback, phase) {
            var that = this;
            // None indicates that it is not a dependency for a specific phase

            phase = phase || 'none';             
        type = type || 'plugin';

            if (that.dependencies[dependency] && 
            that.dependencies[dependency].state === 'requested') { 
                /**
                 * Requested (but loading ist not finished) the module should
                 * be notified, if the dependency has loaded
                 */
                that.dependencies[dependency].callbacks.push(function() {
                    callback(phase);
                });
            }
            else if (that.dependencies[dependency] && 
            that.dependencies[dependency].state === 'loaded') { 
                // Loading finished
                callback(phase);
            }
            else {
                that.dependencies[dependency] = {
                    state: 'requested',
                    callbacks: []
                };

                var path;

                switch (type) {
                    case 'library':
                    case 'plugin':
                    case 'util':
                        path = this.config.dependencyPath[type];
                        break;
                    case 'url':
                        path = '';
                        break;
                    case 'default':
                        path = '';
                        break;
                }

                // Load the appropriate dependency
                var script = document.createElement('script'),
                    firstScript = this.firstScript;
                
                script.src = path + dependency;

                script.onreadystatechange = script.onload = function () {
                    var readyState = script.readyState;
                    if (!readyState || readyState == 'loaded' 
                    || readyState == 'complete') {
                        that.dependencies[dependency].state = 'loaded';
                        callback(phase);

                        // Notify the other modules with this dependency
                        var callbacks = that.dependencies[dependency].callbacks;
                        for (var i = 0, len = callbacks.length; i < len; i++) {
                            callbacks[i]();
                        }

                        // Handle memory leak in IE
                        script.onload = script.onreadystatechange = null;
                    }
                };

                firstScript.parentNode.insertBefore(script, firstScript);
            }
        },

        /**
         * Collects the module status messages and handles the callbacks.
         * This means that it is ready for afterBinding.
         *
         * @method readyForAfterBinding
         * @param {Function} callback 
         *      The afterBinding module callback
         * @return {void}
         */
        readyForAfterBinding: function(callback) {
            var afterBindingCallbacks = this.afterBindingCallbacks;

            // Add the callback to the stack
            afterBindingCallbacks.push(callback);

            // Check whether all modules are ready for the afterBinding phase
            if (this.application.modules.length == 
            afterBindingCallbacks.length) {
                for (var i = 0; i < afterBindingCallbacks.length; i++) {
                    afterBindingCallbacks[i]();
                }
            }
        }
    });
})(Tc.$);

(function($) {
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
         * @param {String} modId 
         *      The Unique module ID
         */
        init: function($ctx, sandbox, modId) {
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
             * @property modId
             * @type String
             */
            this.modId = modId;

            /**
             * Contains the attached connectors.
             *
             * @property connectors
             * @type Array
             */
            this.connectors = [];

            /**
             * Contains the dependency counter for the different phases.
             *
             * @property dependencyCounter
             * @type Object
             */
            this.dependencyCounter = {
                beforeBinding: 0,
                /**
                 * The following counters have to be at least zero, so that
                 * the onBinding callback is loaded as a dependency for
                 * onBinding and the onBinding phase is completed for 
                 * afterBinding.
                 */
                onBinding: 1,
                afterBinding: 1 
            };

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
            // Call the hook method dependencies from the individual instance
            if (this.dependencies) {
                this.dependencies();
            }

            this.initBeforeBinding();
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
         * Initializes the beforeBinding phase.
         *
         * @method initBeforeBinding
         * @return {void}
         */
        initBeforeBinding: function() {
            var that = this;

            /** 
             * Start the beforeBinding phase if there are no dependency for
             * this phase
             */
            this.checkDependencies('beforeBinding', function() {
                /**
                 * Call the hook method beforeBinding from the individual
                 * instance because there might be some ajax calls, the
                 * bindEvents method must be called from the beforeBinding
                 * function after it has been run.
                 */
                if (that.beforeBinding) {
                    that.beforeBinding(function() {
                        that.beforeBindingCallback();
                    });
                }
                else {
                    that.beforeBindingCallback();
                }
            });
        },

        /**
         * Callback for the before binding phase.
         * 
         * @method beforeBindingCallback
         * @return {void}
         */
        beforeBindingCallback: function() {
            // Decrement the dependency counter for the onBinding phase
            this.dependencyCounter.onBinding--;
            this.initOnBinding();
        },

        /**
         * Initializes the onBinding phase.
         *
         * @method initOnBinding
         * @return {void}
         */
        initOnBinding: function() {
            var that = this;

            /** 
             * Start the onBinding phase if there are no dependencies for this
             * phase.
             */
            this.checkDependencies('onBinding',function() {
                // Call the hook method bindEvents from the individual instance
                if (that.onBinding) {
                    that.onBinding();
                }

                // Decrement the dependency counter for the afterBinding phase
                that.dependencyCounter.afterBinding--;
                that.initAfterBinding();
            });
        },

        /**
         * Initializes the afterBinding phase.
         *
         * @method initAfterBinding
         * @return {void}
         */
        initAfterBinding: function() {
            var that = this;

            /**
             * Start the afterBinding phase if there are no dependencies for
             * this phase
             */
            this.checkDependencies('afterBinding', function() {
                /** 
                 * Inform the sandbox that the module is ready for the
                 * afterBinding phase.
                 */
                that.sandbox.readyForAfterBinding(function() {

                    /**
                     * Call the hook method afterBinding from the individual
                     * instance
                     */
                    if (that.afterBinding) {
                        that.afterBinding();
                    }
                });
            });
        },

        /**
         * Checks the dependency load state of the given phase.
         * Initializes the appropriate phase if all dependencies are loaded.
         *
         * @method checkDependencies
         * @param {String} phase 
         *      The phase to check / initialize
         * @param {Function} callback 
         *      The callback to execute if all dependencies were loaded
         * @return {void}
         */
        checkDependencies: function(phase, callback) {
            if (this.dependencyCounter[phase] === 0) {
                // Execute the callback
                callback();
            }
        },

        /**
         * Manages the required dependencies.
         *
         * @method require
         * @param {String} dependency 
         *      The dependency (e.g. swfobject.js)
         * @param {String} type 
         *      The dependency type (library | plugin | util | url)
         * @param {String} phase 
         *      The module phase where the dependency is needed
         *      (e.g. beforeBinding, onBinding)
         * @param {boolean} executeCallback 
         *      Indicates whether the phase callback should be executed or not.
         *      This is useful for dependencies that provide their own callback
         *      mechanism.
         * @return {void}
         */
        require: function(dependency, type, phase, executeCallback) {
            type = type || 'plugin';
            phase = phase || 'onBinding';
            executeCallback = executeCallback === false ? false : true;

            // Increment the dependency counter
            this.dependencyCounter[phase]++;

            // Proxy the callback to the outermost decorator
            var callback = $.proxy(function() {
                if (executeCallback) {
                    var that = this;

                    /**
                     * Decrement the dependency counter for the appropriate
                     * phase.
                     */
                    this.dependencyCounter[phase]--;
                    that['init' + Tc.Utils.String.capitalize(phase)]();
                }
            }, this.sandbox.getModuleById(this.modId));

            this.sandbox.loadDependency(dependency, type, callback, phase);
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

            $.each(connectors, function() {
                var connector = this;

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
            });

            if (connectors.length < 1) {
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
            this.connectors.push(connector);
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

(function($) {
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
         * @param {Object} connectorId
         */
        init : function(connectorId) {
            this.connectorId = connectorId;
            this.components = [];
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

            this.components.push({
                'component': component,
                'role': role
            });
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

            for (var id in components) {
                if (components[id].component === component) {
                    delete components[id];
                }
            }
        },

        /**
         * Notifies all registered components about a state change 
         * This can be be overriden in the specific connectors.
         *
         * @method notify
         * @param {Module} component 
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
        notify: function(component, state, data, callback) {
            
            /**
             * Gives the components the ability to prevent the default- and
             * afteraction from the events by returning false in the
             * on {Event}-Handler.
             */
            
            var proceed = true,
                components = this.components;

            for (var id in components) {
                if (components[id].component !== component && components[id].component[state]) {
                    if (components[id].component[state](data, callback) === false) {
                        proceed = false;
                    }
                }
            }

            return proceed;
        }
    });
})(Tc.$);

/*
 * Contains utility functions for several tasks.
 */
Tc.Utils = {};

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
         * @param {String} str 
         *      The original string
         * @return {String} 
         *      The capitalized string
         */
        capitalize: function(str) {
            // Capitalize the first letter
            return str.substr(0, 1).toUpperCase().concat(str.substr(1));
        }
    };   
})(Tc.$);


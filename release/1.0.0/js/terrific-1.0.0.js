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
 * Terrific JavaScript Framework v1.0.0
 * http://terrificjs.org
 *
 * Copyright 2011, Remo Brunschwiler
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://terrificjs.org/license
 *
 * Date: Fri, 29 Apr 2011 18:11:16 GMT
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
 * Contains the application base config.
 * The base config can be extended or overwritten either via new Application ($ctx, config)
 * during bootstrapping the application or via /public/js/Tc.Config.js in the project folder.
 *
 * @author Remo Brunschwiler
 * @namespace Tc
 * @class Config
 * @static
 */
Tc.Config = {
    /** 
     * The paths for the different dependency types.
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

            $('.mod', $ctx).each(function() {
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
         * @method unregisterModule
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
            else {
                
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
                    

                    // the connector observes the component -> attach it as observer
                    component.attachConnector(connectors[connectorId]);

                    // the component wants to be informed over state changes -> register it as connector member
                    connectors[connectorId].registerComponent(component, connectorRole);
                }
            }
        }
    });
})(Tc.$);

(function($) {
    /**
     * The sandbox is used as a central point to get resources from / grant permissions etc.
     * It is shared between all modules.
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
	     * @param {Applicaton} application the application reference
	     * @param {Object} config the configuration
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
	    },
    
		/**
		 * Adds (register and start) all modules in the given context scope.
		 * 
		 * @method addModules
		 * @param {jQuery} $ctx the jquery context.
		 * @return {Array} a list containing the references of the registered modules.
		 */
		addModules: function($ctx) {
			var modules = [],
                application = this.application;
			
			if($ctx) {
                // reset lazyinit flags
                $('.mod[data-lazyinit=true]', $ctx).removeAttr('data-lazyinit');

				// register modules
				modules = application.registerModules($ctx);
			
				// start modules
				application.start(modules);
			} 
			
			return modules;
		},
		
		/**
		 * Removes (stop and unregister) the modules by the given module instances.
		 * 
		 * @method removeModules
		 * @param {Array} modules a list containting the module instances to remove.
		 * @return {void}
		 */
		removeModules: function(modules) {
            var application = this.application;
            
			if (modules) {
				// stop modules 
				application.stop(modules);
				
				// unregister modules
				application.unregisterModules(modules);
			}
		},

        /**
         * Gets the appropriate module for the given id.
         *
         * @method getModuleById
         * @param {int} id the module id
         * @return {Module} the appropriate module
         */
        getModuleById: function(id) {
            var application = this.application;
            
            if (application.modules[id] !== undefined) {
                return application.modules[id];
            }
            else {
                throw new Error('the module with the id ' + id + ' does not exist');
            }
        },

        /**
         * Gets the application config.
         *
         * @method getConfig
         * @return {Object} the configuration object
         */
        getConfig: function() {
            return this.config;
        },

        /**
         * Gets an application config param.
         *
         * @method getConfigParam
         * @param {String} name the param name
         * @return {mixed} the appropriate configuration param
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
         * @param {String} dependency the dependency (i.e. swfobject.js)
         * @param {String} type the dependency type (plugin | library | util | url)
         * @param {Function} callback the callback to execute after the dependency has successfully loaded
         * @param {String} phase the module phase where the dependency is needed (ie. beforeBinding, onBinding)
         * @return {void}
         */
        loadDependency: function(dependency, type, callback, phase) {
            var that = this;
            
            phase = phase || 'none'; // none indicates that it is not a dependency for a specific phase
            type = type || 'plugin';

            if (that.dependencies[dependency] && that.dependencies[dependency].state === 'requested') { // requested (but loading not finished)
                
                
                // the module should be notified, if the dependency has loaded
                that.dependencies[dependency].callbacks.push(function() {
                    callback(phase);
                });
            }
            else if (that.dependencies[dependency] && that.dependencies[dependency].state === 'loaded') { // loading finished
                
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
                        
                        break;
                }
                
                // load the appropriate dependency
                $.ajax({
                    url: '' + path + dependency,
                    dataType: 'script',
                    cache: true,
                    success: function() {
                        
                        that.dependencies[dependency].state = 'loaded';
                        callback(phase);
                        
                        // notify the other modules with this dependency
                        var callbacks = that.dependencies[dependency].callbacks;
                        for (var i = 0; i < callbacks.length; i++) {
                            callbacks[i]();
                        }
                    },
                    error: function() {
                        
                    }
                });
            }
        },
        
        /**
         * Collects the module status messages (ready for after binding) and handles the callbacks.
         *
         * @method readyForAfterBinding
         * @param {Function} callback the afterBinding module callback
         * @return {void}
         */
        readyForAfterBinding: function(callback) {
            var afterBindingCallbacks = this.afterBindingCallbacks;
            
            // add the callback to the stack
            afterBindingCallbacks.push(callback);
            
            // check whether all modules are ready for the after binding phase
            if (this.application.modules.length == afterBindingCallbacks.length) {
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
         * @param {jQuery} $ctx the jquery context
         * @param {Sandbox} sandbox the sandbox to get the resources from
         * @param {String} modId the unique module id
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
             * Contains the unique module id.
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
                onBinding: 1, // not 0, because of the beforeBinding callback (which is also a dependency)
                afterBinding: 0
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
         * Template method to start (init) the module.
         * This method provides some hook functions which could be overridden from the concrete implementation
         *
         * @method start
         * @return {void}
         */
        start: function() {
            var that = this;

            // call the hook method dependecies from the concrete implementation
            if (this.dependencies) {
                this.dependencyCounter.beforeBinding++;
                this.dependencies();
                this.dependencyCounter.beforeBinding--;
            }

            // start the before binding phase if there are no dependency for this phase
            this.checkDependencies('beforeBinding', function() {
                that.initBeforeBinding();
            });
        },

        /**
         * Template method to stop the module.
         *
         * @method stop
         * @return {void}
         */
        stop: function() {
            var $ctx = this.$ctx;
            
            // remove all bound events and associated jquery data
            $('*', $ctx).unbind().removeData();
            $ctx.unbind().removeData();
        },

        /**
         * Initializes the before binding phase.
         *
         * @method initBeforeBinding
         * @return {void}
         */
        initBeforeBinding: function() {
            var that = this;

            // call the hook method beforeBinding from the concrete implementation
            // because there might be some ajax calls, the bindEvents method must be called from
            // the beforeBinding function after it has been run
            if (this.beforeBinding) {
                this.beforeBinding(function() {
                    that.beforeBindingCallback();
                });
            }
            else {
                this.beforeBindingCallback();
            }
        },

        /**
         * Callback for the before binding phase.
         * 
         * @method beforeBindingCallback
         * @return {void}
         */
        beforeBindingCallback: function() {
            var that = this;

            // decrement the dependency counter for the on binding phase
            this.dependencyCounter.onBinding--;

            // start the on binding phase if there are no dependencies for this phase
            this.checkDependencies('onBinding',function() {
                that.initOnBinding();
            });
        },

        /**
         * Initializes the on binding phase.
         *
         * @method initOnBinding
         * @return {void}
         */
        initOnBinding: function() {
            var that = this;

            // call the hook method bindEvents from the concrete implementation
            if (this.onBinding) {
                this.onBinding();
            }

            // start the after binding phase if there are no dependencies for this phase
            this.checkDependencies('afterBinding', function() {
                that.initAfterBinding();
            });
        },

        /**
         * Initializes the after binding phase.
         *
         * @method initAfterBinding
         * @return {void}
         */
        initAfterBinding: function() {
            var that = this;

            // inform the sandbox that the module is ready for the after binding phase
            this.sandbox.readyForAfterBinding(function() {

                // call the hook method afterBinding from the concrete implementation
                if (that.afterBinding) {
                    that.afterBinding();
                }
            });
        },

        /**
         * Checks the dependency load state of the given phase.
         * Initializes the appropriate phase if all dependencies are loaded.
         *
         * @method checkDependencies
         * @param {String} phase the phase to check / initialize
         * @param {Function} callback the callback to execute if all dependencies were loaded
         * @return {void}
         */
        checkDependencies: function(phase, callback) {
            if (this.dependencyCounter[phase] === 0) {
                // execute the callback
                callback();
            }
        },

        /**
         * Manages the required dependencies.
         *
         * @method require
         * @param {String} dependency the dependency (i.e. swfobject.js)
         * @param {String} type the dependency type (library | plugin | util | url)
         * @param {String} phase the module phase where the dependency is needed (ie. beforeBinding, onBinding)
         * @param {boolean} executeCallback indicates whether the phase callback should be executed or not (useful for dependencies that provide their own callback mechanism)
         * @return {void}
         */
        require: function(dependency, type, phase, executeCallback) {
            
            type = type || 'plugin';
            phase = phase || 'onBinding';
            executeCallback = executeCallback === false ? false : true;

            // increment the dependency counter
            this.dependencyCounter[phase]++;

            // proxy the callback to the outermost decorator
            var callback = $.proxy(function() {
                if (executeCallback) {
                    var that = this;

                    // decrement the dependency counter for the appropriate phase
                    this.dependencyCounter[phase]--;
                    this.checkDependencies(phase, function() {
                        that['init' + Tc.Utils.String.capitalize(phase)]();
                    });
                }
            }, this.sandbox.getModuleById(this.modId));

            this.sandbox.loadDependency(dependency, type, callback, phase);
        },

        /**
         * Notifies all attached connectors about changes.
         *
         * @method fire
         * @param {String} state the new state
         * @param {Object} data the data to provide to your connected modules
         * @param {Function} defaultAction the default action to perform
         * @return {void}
         */
        fire: function(state, data, defaultAction) {
            var that = this,
                connectors = this.connectors;
            
            data = data ||{};
            state = Tc.Utils.String.capitalize(state);

            $.each(connectors, function() {
                var connector = this;

                // callback combining the defaultAction and the afterAction
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
         * @param {Connector} connector the connector to attach
         * @return {void}
         */
        attachConnector: function(connector) {
            this.connectors.push(connector);
        },

        /**
         * Decorates itself with the given skin.
         *
         * @method getDecoratedModule
         * @param {String} module the name of the module
         * @param {String} skin the name of the skin
         * @return {Module} the decorated module
         */
        getDecoratedModule: function(module, skin) {
            if (Tc.Module[module][skin]) {
                var decorator = Tc.Module[module][skin];

                /*
                 * Sets the prototype object to the module.
                 * So the "non-decorated" functions will be called on the module (without implementing the whole module interface).
                 */
                decorator.prototype = this;
                decorator.prototype.constructor = Tc.Module[module][skin];

                return new decorator(this);
            }
            else {
                
                return null;
            }
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
         * @param {String} connectorId the unique connector id
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
         * @param {Module} component the module to register
         * @param {String} role the role of the module (ie. master, slave etc.)
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
         * @param {Module} component the module to unregister
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
         * Notifies all registered components about the state change (to be overriden in the specific connectors).
         *
         * @method notify
         * @param {Module} component the module that sends the state change
         * @param {String} state the state
         * @param {Object} data contains the state relevant data (if any)
         * @param {Function} callback the callback function (could be executed after an asynchronous action)
         * @return {boolean} indicates whether the default action should be excuted or not
         */
        notify: function(component, state, data, callback) {
            /* 
             * gives the components the ability to prevent the default- and afteraction from the events
             * (by returning false in the on<Event>-Handler)
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
         * @param {String} str the original string
         * @return {String} the capitalized string
         */
        capitalize: function(str) {
            // capitalize the first letter
            return str.substr(0, 1).toUpperCase().concat(str.substr(1));
        }
    };   
})(Tc.$);


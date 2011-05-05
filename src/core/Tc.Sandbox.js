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
                        path = '';
                        break;
                }
                
                // load the appropriate dependency
                $.ajax({
                    url: path + dependency,
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


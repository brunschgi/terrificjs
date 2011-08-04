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
         * @param {Applicaton} application The application reference
         * @param {Object} config The configuration
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
         * @param {jQuery} $ctx The jquery context.
         * @return {Array} A list containing the references of the registered modules.
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
         * @param {Array} modules A list containting the module instances to remove.
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
         * @param {int} id The module ID
         * @return {Module} The appropriate module
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
         * @return {Object} The configuration object
         */
        getConfig: function() {
            return this.config;
        },

        /**
         * Gets an application config param.
         *
         * @method getConfigParam
         * @param {String} name The param name
         * @return {mixed} The appropriate configuration param
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
         * @param {String} dependency The dependency (i.e. swfobject.js)
         * @param {String} type The dependency type (plugin | library | util | url)
         * @param {Function} callback The callback to execute after the dependency has successfully loaded
         * @param {String} phase The module phase where the dependency is needed (ie. beforeBinding, onBinding)
         * @return {void}
         */
        loadDependency: function(dependency, type, callback, phase) {
            var that = this;
            // None indicates that it is not a dependency for a specific phase

            phase = phase || 'none';             
        type = type || 'plugin';

            if (that.dependencies[dependency] && that.dependencies[dependency].state === 'requested') { 
        // Requested (but loading ist not finished) the module should be
        // notified, if the dependency has loaded
                that.dependencies[dependency].callbacks.push(function() {
                    callback(phase);
                });
            }
            else if (that.dependencies[dependency] && that.dependencies[dependency].state === 'loaded') { // Loading finished
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
                    if (!readyState || readyState == 'loaded' || readyState == 'complete') {
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
         * @param {Function} callback The afterBinding module callback
         * @return {void}
         */
        readyForAfterBinding: function(callback) {
            var afterBindingCallbacks = this.afterBindingCallbacks;

            // Add the callback to the stack
            afterBindingCallbacks.push(callback);

            // Check whether all modules are ready for the afterBinding phase
            if (this.application.modules.length == afterBindingCallbacks.length) {
                for (var i = 0; i < afterBindingCallbacks.length; i++) {
                    afterBindingCallbacks[i]();
                }
            }
        }
    });
})(Tc.$);


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
         * @param {jQuery} $ctx The jquery context
         * @param {Sandbox} sandbox The sandbox to get the resources from
         * @param {String} modId the Unique module ID
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
                onBinding: 1, // Not 0, because of the beforeBinding callback (which is also a dependency)
                afterBinding: 1 // Not 0, because a completed onBinding phase is required (which is also a dependency)
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
            // Call the hook method dependecies from the concrete implementation
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
         * Initializes the before binding phase.
         *
         * @method initBeforeBinding
         * @return {void}
         */
        initBeforeBinding: function() {
            var that = this;

             // Start the before binding phase if there are no dependency for this phase
            this.checkDependencies('beforeBinding', function() {
                // Call the hook method beforeBinding from the concrete implementation
                // because there might be some ajax calls, the bindEvents method must be called from
                // the beforeBinding function after it has been run
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
            // Decrement the dependency counter for the on binding phase
            this.dependencyCounter.onBinding--;
            this.initOnBinding();
        },

        /**
         * Initializes the on binding phase.
         *
         * @method initOnBinding
         * @return {void}
         */
        initOnBinding: function() {
            var that = this;

            // Start the on binding phase if there are no dependencies for this phase
            this.checkDependencies('onBinding',function() {
                // Call the hook method bindEvents from the concrete implementation
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

            // Start the afterBinding phase if there are no dependencies for this phase
            this.checkDependencies('afterBinding', function() {
                // Inform the sandbox that the module is ready for the afterBinding phase
                that.sandbox.readyForAfterBinding(function() {

                    // Call the hook method afterBinding from the concrete implementation
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
         * @param {String} phase The phase to check / initialize
         * @param {Function} callback The callback to execute if all dependencies were loaded
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
         * @param {String} dependency the dependency (i.e. swfobject.js)
         * @param {String} type The dependency type (library | plugin | util | url)
         * @param {String} phase The module phase where the dependency is needed (ie. beforeBinding, onBinding)
         * @param {boolean} executeCallback Indicates whether the phase callback should be executed or not (useful for dependencies that provide their own callback mechanism)
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

                    // Decrement the dependency counter for the appropriate phase
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
         * @param {String} state The new state
         * @param {Object} data The data to provide to your connected modules
         * @param {Function} defaultAction The default action to perform
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
         * @param {Connector} connector The connector to attach
         * @return {void}
         */
        attachConnector: function(connector) {
            this.connectors.push(connector);
        },

        /**
         * Decorates itself with the given skin.
         *
         * @method getDecoratedModule
         * @param {String} module The name of the module
         * @param {String} skin The name of the skin
         * @return {Module} The decorated module
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

            return null;
        }
    });
})(Tc.$);


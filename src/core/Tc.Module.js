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
                $.log.info('the skin ' + skin + ' does not exists for this module');
                return null;
            }
        }
    });
})(Tc.$);


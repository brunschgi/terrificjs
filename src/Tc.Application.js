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
     * @param {Node} ctx
     *      The context node
     * @param {Object} config
     *      The configuration
     */
    init: function (ctx, config) {

        // validate params
        if (!ctx && !config) {
            // both empty
            ctx = document;
            config = {};
        }
        else if(config instanceof Node) {
            // reverse order of arguments
            var tmpConfig = config;
            config = ctx;
            ctx = tmpConfig;
        }
        else if (!(ctx instanceof Node) && !config) {
            // only config is given
            config = ctx;
            ctx = document;
        }
        else if(ctx instanceof Node && !config) {
            // only ctx is given
            config = {};
        }

        /**
         * The context node.
         *
         * @property ctx
         * @type Element
         */
        this.ctx = ctx;

        /**
         * The configuration.
         *
         * @property config
         * @type Object
         */
        this.config = config;

        /**
         * The sandbox to get the resources from.
         * The singleton is shared between all modules.
         *
         * @property sandbox
         * @type Sandbox
         */
        this.sandbox = new Tc.Sandbox(this, this.config);

        /**
         * Contains the registered hooks.
         *
         * @property hooks
         * @type Array
         */
        this.hooks = [];

        /**
         * Contains references to all modules on the page.
         *
         * @property modules
         * @type Object
         */
        this.modules = {};

        /**
         * The next unique module id to use.
         *
         * @property id
         * @type Number
         */
        this.id = 1;
    },

    /**
     * Register modules within the context
     * Automatically registers all modules within the context,
     * as long as the modules use the naming conventions.
     *
     * @method registerModules
     * @param {Node} ctx
     *      The context node
     * @return {Object}
     *      A collection containing the registered modules
     */
    registerModules: function (ctx) {
        var modules = {},
            utils = Tc.Utils;

        ctx = ctx || this.ctx;

        var fragment = document.createDocumentFragment();
        fragment.appendChild(ctx);

        [].forEach.call(fragment.querySelectorAll('[data-tc-name]'), function (ctx) {

            /*
             * A module can have different data attributes.
             * See below for possible values.
             */

            /*
             * @config data-tc-name="{mod-name}"
             *
             * Indicates that a JavaScript module should be bound.
             * It can occur at most once.
             *
             * Example: data-tc-name="basic"
             */

            /*
             * @config data-tc-skin="{skin-name}"
             *
             * Indicates that the module Basic should be decorated by the JS skin Submarine. It can occur at most
             * once. Multiple skins should be comma-separated.
             *
             * Example: data-tc-skin="submarine"
             */

            var mod = utils.capitalize(utils.camelize(ctx.dataset.tcName.trim()));
            var skins = ctx.dataset.tcSkin ? ctx.dataset.tcSkin.split(',') : [];

            skins = skins.map(function(skin) {
                return utils.capitalize(utils.camelize(skin.trim()));
            });

            var module = this.registerModule(ctx, mod, skins);

            if(module) {
                modules[module.id] = module;
            }
        }.bind(this));

        return modules;
    },

    /**
     * Unregisters the modules given by the module instances.
     *
     * @method unregisterModules
     * @param {Object} modules
     *      A collection containing the modules to unregister
     */
    unregisterModules: function (modules) {
        modules = modules || this.modules;

        // unregister the given modules
        for (var id in modules) {
            if(modules.hasOwnProperty(id)) {
                delete this.modules[id];
            }
        }
    },

    /**
     * Starts (intializes) the registered modules.
     *
     * @method start
     * @param {Object} modules
     *      A collection of modules to start
     * @return {Promise}
     *      The after callback sync Promise
     */
    start: function (modules) {
        modules = modules || this.modules;

        var promises = [];

        // start the modules
        for (var id in modules) {
            if(modules.hasOwnProperty(id)) {
                var promise = modules[id].start();
                if(!(promise instanceof Promise)) {
                    throw Error('The module with the id ' + id +
                    ' does not return a Promise on start');
                }
                promises.push(promise);
            }
        }

        // return self-fullfilling Promise if no modules are found
        if(promises.length === 0) {
            return new Promise(function(resolve) {
                resolve([]);
            });
        }

        // synchronize after callbacks
        var all = Promise.all(promises);
        all.then(function(callbacks) {
                callbacks.forEach(function(callback) {
                    callback();
                });
            }.bind(this))
            .catch(function(error) {
                throw Error('Synchronizing the after callbacks failed: ' + error);
            });

        return all;
    },

    /**
     * Stops the registered modules.
     *
     * @method stop
     * @param {Object} modules
     *      A collection of modules to stop
     */
    stop: function (modules) {
        modules = modules || this.modules;

        // stop the modules
        for (var id in modules) {
            if(modules.hasOwnProperty(id)) {
                modules[id].stop();
            }
        }
    },

    /**
     * Registers a module.
     *
     * @method registerModule
     * @param {Node} ctx
     *      The context node
     * @param {String} mod
     *      The module name. It must match the class name of the module
     * @param {Array} skins
     *      A list of skin names. Each entry must match a class name of a skin
     * @return {Module}
     *      The reference to the registered module
     */
    registerModule: function (ctx, mod, skins) {
        var modules = this.modules;

        mod = mod || undefined;
        skins = skins || [];

        if (mod && Tc.Module[mod]) {
            // assign the module a unique id
            var id = this.id++;
            ctx.dataset.tcId = id;

            // instantiate module
            modules[id] = new Tc.Module[mod](ctx, this.sandbox, id);

            // decorate it
            skins.forEach(function(skin) {
                if (Tc.Module[mod][skin]) {
                    Tc.Module[mod][skin](modules[id]);
                }
            });

            return modules[id];
        }

        return null;
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
        if (this.modules[id] !== undefined) {
            return this.modules[id];
        }
        else {
            throw Error('The module with the id ' + id +
            ' does not exist');
        }
    }
});


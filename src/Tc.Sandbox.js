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
    },

    /**
     * Adds (register and start) all modules in the given context scope.
     *
     * @method addModules
     * @param {Node} ctx
     *      The context node
     * @return {Object}
     *      A collection containing the registered modules
     */
    addModules: function (ctx) {
        var modules = [],
            application = this.application;

        if (ctx instanceof Node) {
            // register modules
            modules = application.registerModules(ctx);

            // start modules
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
     *      A collection of module to remove | Node context to look for registered modules in.
     */
    removeModules: function (modules) {
        var application = this.application;

        if (modules instanceof Node) {
            // get modules
            var tmpModules = [];

            var fragment = document.createDocumentFragment();
            fragment.appendChild(modules);

            [].forEach.call(fragment.querySelectorAll('[data-tc-name]'), function (ctx) {
                // check for instance
                var id = ctx.dataset.tcId;

                if (id !== undefined) {
                    var module = this.getModuleById(id);

                    if (module) {
                        tmpModules.push(module);
                    }
                }
            }.bind(this));

            modules = tmpModules;
        }

        if (Array.isArray(modules)) {
            // stop modules – let the module clean itself
            application.stop(modules);

            // unregister modules – clean up the application
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
    getModuleById: function (id) {
        return this.application.getModuleById(id);
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
            throw Error('The config param ' + name + ' does not exist');
        }
    }
});


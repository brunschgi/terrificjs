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


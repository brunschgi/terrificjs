/**
 * The sandbox is used as a central point to get resources from, add modules etc.
 * It is shared between all modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Sandbox
 *
 * @constructor
 * @param {Application} application
 *      The application reference
 * @param {Object} config
 *      The configuration
 */
/* global Utils */
function Sandbox(application, config) {
	/**
	 * The application.
	 *
	 * @property _application
	 * @type Application
	 */
	this._application = application;

	/**
	 * The configuration.
	 *
	 * @property config
	 * @type Object
	 */
	this._config = config;

	/**
	 * Contains references to all module connectors.
	 *
	 * @property _connectors
	 * @type Array
	 */
	this._connectors = [];
}

/**
 * Adds (register and start) all modules in the given context scope.
 *
 * @method addModules
 * @param {Node} ctx
 *      The context node
 * @return {Object}
 *      A collection containing the registered modules
 */
Sandbox.prototype.addModules = function (ctx) {
	var modules = [],
		application = this._application;

	if (Utils.isNode(ctx)) {
		// register modules
		modules = application.registerModules(ctx);

		// start modules
		application.start(modules);
	}

	return modules;
};

/**
 * Removes a module by module instances.
 * This stops and unregisters a module through a module instance.
 *
 * @method removeModules
 * @param {any} modules
 *      A collection of module to remove | Node context to look for registered modules in.
 * @return {Sandbox}
 */
Sandbox.prototype.removeModules = function (modules) {
	var application = this._application;

	if (Utils.isNode(modules)) {
		// get modules
		var tmpModules = [];

		var nodes = Utils.getModuleNodes(modules);
		nodes.forEach(function (ctx) {
			// check for instance
			var id = ctx.getAttribute('data-t-id');

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

	return this;
};

/**
 * Gets the appropriate module for the given ID.
 *
 * @method getModuleById
 * @param {int} id
 *      The module ID
 * @return {Module}
 *      The appropriate module
 */
Sandbox.prototype.getModuleById = function (id) {
	return this._application.getModuleById(id);
};

/**
 * Gets the application config.
 *
 * @method getConfig
 * @return {Object}
 *      The configuration object
 */
Sandbox.prototype.getConfig = function () {
	return this._config;
};

/**
 * Gets an application config param.
 *
 * @method getConfigParam
 * @param {String} name
 *      The param name
 * @return {any}
 *      The appropriate configuration param
 */
Sandbox.prototype.getConfigParam = function (name) {
	var config = this._config;

	if (config[name] !== undefined) {
		return config[name];
	}
	else {
		throw Error('The config param ' + name + ' does not exist');
	}
};

/**
 * Adds a connector instance.
 *
 * @method addConnector
 * @param {Connector} connector
 *      The connector
 * @return {Sandbox}
 */
Sandbox.prototype.addConnector = function (connector) {
	this._connectors.push(connector);
	return this;
};

/**
 * Removes a connector instance.
 *
 * @method addConnector
 * @param {Connector} connector
 *      The connector
 * @return {Sandbox}
 */
Sandbox.prototype.removeConnector = function (connector) {
	var connectors = this._connectors;
	for (var i = 0, len = connectors.length; i < len; i++) {
		if (connectors[i] === connector) {
			connectors.splice(i, 1);
			break;
		}
	}
	return this;
};

/**
 * Dispatches the event with the given arguments to the attached connectors.
 *
 * @method dispatch
 * @param {Mixed} ...
 * @return {Sandbox}
 */
Sandbox.prototype.dispatch = function () {
	var connectors = this._connectors;

	for(var i = 0, len = connectors.length; i < len; i++) {
		var connector = connectors[i];
		connector.handle.apply(connector, arguments);
	}

	return this;
};
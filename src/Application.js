/*!
 * TerrificJS modularizes your frontend code by solely relying on naming conventions.
 * http://terrifically.org
 *
 * @copyright   Copyright (c) <%= grunt.template.today('yyyy') %> Remo Brunschwiler
 * @license     Licensed under MIT license
 * @version     <%= pkg.version %>
 */

/**
 * @module T
 */

/**
 * Responsible for application-wide issues such as the creation of modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Application
 *
 * @constructor
 * @param {Node} ctx
 *      The context node
 * @param {Object} config
 *      The configuration
 */
/* global Sandbox, Module, Utils */
function Application(ctx, config) {
	// validate params
	if (!ctx && !config) {
		// both empty
		ctx = document;
		config = {};
	}
	else if (config instanceof Node) {
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
	else if (ctx instanceof Node && !config) {
		// only ctx is given
		config = {};
	}

	/**
	 * The context node.
	 *
	 * @property _ctx
	 * @type Node
	 */
	this._ctx = ctx;

	/**
	 * The sandbox to get the resources from.
	 * The singleton is shared between all modules.
	 *
	 * @property _sandbox
	 * @type Sandbox
	 */
	this._sandbox = new Sandbox(this, config);

	/**
	 * Contains references to all modules on the page.
	 *
	 * @property _modules
	 * @type Object
	 */
	this._modules = {};

	/**
	 * The next unique module id to use.
	 *
	 * @property id
	 * @type Number
	 */
	this._id = 1;
}

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
Application.prototype.registerModules = function (ctx) {
	var modules = {};

	ctx = ctx || this._ctx;

	var fragment = document.createDocumentFragment();
	fragment.appendChild(ctx);

	[].forEach.call(fragment.querySelectorAll('[data-t-name]'), function (ctx) {

		/*
		 * A module can have different data attributes.
		 * See below for possible values.
		 */

		/*
		 * @config data-t-name="{mod-name}"
		 *
		 * Indicates that a JavaScript module should be bound.
		 * It can occur at most once.
		 *
		 * Example: data-t-name="basic"
		 */

		/*
		 * @config data-t-skin="{skin-name}"
		 *
		 * Indicates that the module Basic should be decorated by the JS skin Submarine. It can occur at most
		 * once. Multiple skins should be comma-separated.
		 *
		 * Example: data-t-skin="submarine"
		 */

		var mod = Utils.capitalize(Utils.camelize(ctx.getAttribute('data-t-name').trim()));
		var skins = ctx.getAttribute('data-t-skin') ? ctx.getAttribute('data-t-skin').split(',') : [];

		skins = skins.map(function (skin) {
			return Utils.capitalize(Utils.camelize(skin.trim()));
		});

		var module = this.registerModule(ctx, mod, skins);

		if (module) {
			modules[module.id] = module;
		}
	}.bind(this));

	return modules;
};

/**
 * Unregisters the modules given by the module instances.
 *
 * @method unregisterModules
 * @param {Object} modules
 *      A collection containing the modules to unregister
 */
Application.prototype.unregisterModules = function (modules) {
	modules = modules || this._modules;

	// unregister the given modules
	for (var id in modules) {
		if (modules.hasOwnProperty(id)) {
			delete this._modules[id];
		}
	}
};

/**
 * Starts (intializes) the registered modules.
 *
 * @method start
 * @param {Object} modules
 *      A collection of modules to start
 * @return {Promise}
 *      The after callback sync Promise
 */
Application.prototype.start = function (modules) {
	modules = modules || this._modules;

	var promises = [];

	// start the modules
	for (var id in modules) {
		if (modules.hasOwnProperty(id)) {
			var promise = modules[id].start();
			if (!(promise instanceof Promise)) {
				throw Error('The module with the id ' + id +
				' does not return a Promise on start');
			}
			promises.push(promise);
		}
	}

	// return self-fullfilling Promise if no modules are found
	if (promises.length === 0) {
		return new Promise(function (resolve) {
			resolve([]);
		});
	}

	// synchronize after callbacks
	var all = Promise.all(promises);
	all.then(function (callbacks) {
		for(var i = 0, len = callbacks.length; i < len; i++) {
			callbacks[i]();
		}
	}.bind(this))
		.catch(function (error) {
			throw Error('Synchronizing the after callbacks failed: ' + error);
		});

	return all;
};

/**
 * Stops the registered modules.
 *
 * @method stop
 * @param {Object} modules
 *      A collection of modules to stop
 */
Application.prototype.stop = function (modules) {
	modules = modules || this._modules;

	// stop the modules
	for (var id in modules) {
		if (modules.hasOwnProperty(id)) {
			modules[id].stop();
		}
	}
};

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
Application.prototype.registerModule = function (ctx, mod, skins) {
	var modules = this._modules;

	mod = mod || undefined;
	skins = skins || [];

	if (mod && Module[mod]) {
		// assign the module a unique id
		var id = this._id++;
		ctx.setAttribute('data-t-id', id);

		// instantiate module
		modules[id] = new Module[mod](ctx, this._sandbox, id);

		// decorate it
		for(var i = 0, len = skins.length; i < len; i++) {
			var skin = skins[i];

			if (Module[mod][skin]) {
				Module[mod][skin](modules[id]);
			}
		}

		return modules[id];
	}

	return null;
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
Application.prototype.getModuleById = function (id) {
	if (this._modules[id] !== undefined) {
		return this._modules[id];
	}
	else {
		throw Error('The module with the id ' + id +
		' does not exist');
	}
};

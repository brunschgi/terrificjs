/**
 * Base class for the different modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Module
 *
 * @constructor
 * @param {Node} ctx
 *      The context node
 * @param {Sandbox} sandbox
 *      The sandbox to get the resources from
 * @param {String} id
 *      The Unique module ID
 */
/* global Connector */
function Module(ctx, sandbox, id) {

	/**
	 * Contains the context node.
	 *
	 * @property ctx
	 * @type Node
	 */
	this.ctx = ctx;

	/**
	 * The sandbox to get the resources from.
	 *
	 * @property sandbox
	 * @type Sandbox
	 */
	this.sandbox = sandbox;

	/**
	 * The emitter.
	 *
	 * @property events
	 * @type Emitter
	 */
	this.events = new Connector(sandbox);

	/**
	 * Contains the unique module id.
	 *
	 * @property id
	 * @type Number
	 */
	this.id = id;
}

/**
 * Starts the module.
 *
 * @method start
 * @return {Promise} The promise to synchronize after callbacks
 */
Module.prototype.start = function () {
	var callback = function () {
		if (this.after) {
			this.after();
		}
	}.bind(this);

	return new Promise(function (resolve) {
		if (this.on) {
			this.on(function () {
				resolve(callback);
			});
		}
		else {
			resolve(callback);
		}
	}.bind(this));
};

/**
 * Template method to stop the module.
 *
 * @method stop
 */
Module.prototype.stop = function () {
	this.events.removeAllListeners();
};

/**
 * Template method for the main logic.
 *
 * @method on
 * @param {Function} callback
 *      The synchronize callbackk
 */
Module.prototype.on = function (callback) {
	callback();
};

/**
 * Template method for the synchronized logic.
 *
 * @method after
 */
Module.prototype.after = function () {
};
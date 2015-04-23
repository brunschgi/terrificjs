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
 */
/* global Connector */
function Module(ctx, sandbox) {
	/**
	 * Contains the context node.
	 *
	 * @property ctx
	 * @type Node
	 */
	this._ctx = ctx;

	/**
	 * The sandbox to get the resources from.
	 *
	 * @property _sandbox
	 * @type Sandbox
	 */
	this._sandbox = sandbox;

	/**
	 * The emitter.
	 *
	 * @property _events
	 * @type Emitter
	 */
	this._events = new Connector(sandbox);
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
	this._events.disconnect();
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
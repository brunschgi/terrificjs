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
/* global EventEmitter */
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
	 * @type EventEmitter
	 */
	this._events = new EventEmitter(sandbox);
}

/**
 * Template method to start the module.
 *
 * @method start
 * @param {Function} resolve
 *      The resolve promise function
 * @param {Function} reject
 * 		The reject promise function
 */
/*jshint unused: true */
Module.prototype.start = function (resolve) {
	resolve();
};

/**
 * Template method to stop the module.
 *
 * @method stop
 */
Module.prototype.stop = function () {
	this._events.off().disconnect();
};

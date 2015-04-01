/**
 * Proxy for the Emitter instance of the sandbox.
 * Manages local references to the listener functions and adapts the api for modules.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class ModuleEmitter
 *
 * @constructor
 * @param {Emitter} emitter
 *      The emitter instance to decorate
 */
function ModuleEmitter(emitter) {

	/**
	 * The module instance.
	 *
	 * @property module
	 * @type Module
	 */
	this.emitter = emitter;

	/**
	 * The emitter.
	 *
	 * @property emitter
	 * @type Emitter
	 */
	this.emitter = emitter;

	/**
	 * The listeners.
	 *
	 * @property listeners
	 * @type Object
	 */
	this.listeners = {};
}

/**
 * Adds a listener for the given event.
 *
 * @method on
 * @param {String} event
 * @param {Function} listener
 * @return {ModuleEmitter}
 */
ModuleEmitter.prototype.on = ModuleEmitter.prototype.addListener = function (event, listener) {
	(this.listeners[event] = this.listeners[event] || []).push(listener);

	this.emitter.on(event, listener);

	return this;
};

/**
 * Adds a listener that will be invoked a single
 * time and automatically removed afterwards.
 *
 * @method once
 * @param {String} event
 * @param {Function} listener
 * @return {ModuleEmitter}
 */
ModuleEmitter.prototype.once = function (event, listener) {
	(this.listeners[event] = this.listeners[event] || []).push(listener);

	this.emitter.once(event, listener);

	return this;
};

/**
 * Remove the given listener for the given event or all
 * registered listeners.
 *
 * @method off
 * @param {String} event
 * @param {Function} listener
 * @return {ModuleEmitter}
 */
ModuleEmitter.prototype.off = ModuleEmitter.prototype.removeListener = ModuleEmitter.prototype.removeAllListeners = function (event, listener) {
	var off = function (event) {
		for (var i = 0; i < this.listeners.length; i++) {
			this.emitter.off(event, this.listeners[i]);
		}
	}.bind(this);

	// all
	if (arguments.length === 0) {
		// remove all listeners
		for (var name in this.listeners) {
			if (this.listeners.hasOwnProperty(name)) {
				off(name);
			}
		}

		this.listeners = {};

		return this;
	}

	// specific event
	var listeners = this.listeners[event];
	if (!listeners) {
		return this;
	}

	// remove all listeners
	if (arguments.length === 1) {
		off(event);
		delete this.listeners[event];
		return this;
	}

	// remove specific listener
	var cb;
	for (var i = 0; i < listeners.length; i++) {
		cb = listeners[i];
		if (cb === listener || cb.listener === listener) {
			this.emitter.off(event, listeners.splice(i, 1));
			break;
		}
	}

	return this;
};

/**
 * Emit event with the given arguments.
 *
 * @method emit
 * @param {Mixed} ...
 * @return {ModuleEmitter}
 */
ModuleEmitter.prototype.emit = function () {
	this.emitter.emit.apply(this.emitter, arguments);

	return this;
};

/**
 * Return array of listeners for the given event.
 *
 * @method listeners
 * @param {String} event
 * @return {Array}
 */
ModuleEmitter.prototype.listeners = function (event) {
	return this.listeners[event] || [];
};

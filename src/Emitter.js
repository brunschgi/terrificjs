/**
 * Responsible for inter-module communication.
 * Classic EventEmitter pattern. Inspired by https://github.com/component/emitter
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Emitter
 *
 * @constructor
 */
function Emitter() {

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
 * @return {Emitter}
 */
Emitter.prototype.on = Emitter.prototype.addListener = function (event, listener) {
	(this.listeners[event] = this.listeners[event] || []).push(listener);
	return this;
};

/**
 * Adds a listener that will be invoked a single
 * time and automatically removed afterwards.
 *
 * @method once
 * @param {String} event
 * @param {Function} listener
 * @return {Emitter}
 */
Emitter.prototype.once = function (event, listener) {
	function on() {
		this.off(event, on);
		listener.apply(this, arguments);
	}

	on.listener = listener;
	this.on(event, on);
	return this;
};

/**
 * Remove the given listener for the given event or all
 * registered listeners.
 *
 * @method off
 * @param {String} event
 * @param {Function} listener
 * @return {Emitter}
 */
Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = function (event, listener) {

	// all
	if (arguments.length === 0) {
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
		delete this.listeners[event];
		return this;
	}

	// remove specific listener
	var cb;
	for (var i = 0; i < listeners.length; i++) {
		cb = listeners[i];
		if (cb === listener || cb.listener === listener) {
			listeners.splice(i, 1);
			break;
		}
	}

	return this;
};

/**
 * Emit event with the given arguments.
 *
 * @method emit
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */
Emitter.prototype.emit = function (event) {
	var args = [].slice.call(arguments, 1),
		listeners = this.listeners[event];

	if (listeners) {
		listeners = listeners.slice(0);
		for (var i = 0, len = listeners.length; i < len; ++i) {
			listeners[i].apply(this, args);
		}
	}

	return this;
};

/**
 * Return array of listeners for the given event.
 *
 * @method listeners
 * @param {String} event
 * @return {Array}
 */
Emitter.prototype.listeners = function (event) {
	return this.listeners[event] || [];
};



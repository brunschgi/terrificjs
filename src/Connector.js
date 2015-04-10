/**
 * Responsible for inter-module communication.
 * Classic EventEmitter Api. Heavily inspired by https://github.com/component/emitter
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Connector
 *
 * @constructor
 *
 * @param {Sandbox} sandbox
 *      The sandbox instance
 */
function Connector(sandbox) {
	/**
	 * The listeners.
	 *
	 * @property _listeners
	 * @type Object
	 */
	this._listeners = {};

	/**
	 * The sandbox instance.
	 *
	 * @property _sandbox
	 * @type Sandbox
	 */
	this._sandbox = sandbox;

	/**
	 * Indicates whether the instance is connected to the sandbox.
	 *
	 * @property _connected
	 * @type Boolean
	 */
	this._connected = false;
}

/**
 * Adds a listener for the given event.
 *
 * @method on
 * @param {String} event
 * @param {Function} listener
 * @return {Connector}
 */
Connector.prototype.on = Connector.prototype.addListener = function (event, listener) {
	this.connect();

	(this._listeners['$' + event] = this._listeners['$' + event] || []).push(listener);
	return this;
};

/**
 * Adds a listener that will be invoked a single
 * time and automatically removed afterwards.
 *
 * @method once
 * @param {String} event
 * @param {Function} listener
 * @return {Connector}
 */
Connector.prototype.once = function (event, listener) {
	this.connect();

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
 * @return {Connector}
 */
Connector.prototype.off = Connector.prototype.removeListener = Connector.prototype.removeAllListeners = function (event, listener) {
	// all
	if (arguments.length === 0) {
		this._listeners = {};
		return this;
	}

	// specific event
	var listeners = this._listeners['$' + event];
	if (!listeners) {
		return this;
	}

	// remove all listeners
	if (arguments.length === 1) {
		delete this._listeners['$' + event];
		return this;
	}

	// remove specific listener
	var cb;
	for (var i = 0, len = listeners.length; i < len; i++) {
		cb = listeners[i];
		if (cb === listener || cb.listener === listener) {
			listeners.splice(i, 1);
			break;
		}
	}

	return this;
};

/**
 * Dispatches event to the sandbox.
 *
 * @method emit
 * @param {Mixed} ...
 * @return {Connector}
 */
Connector.prototype.emit = function () {
	this.connect();

	// dispatches event to the sandbox
	this._sandbox.dispatch.apply(this._sandbox, arguments);

	return this;
};

/**
 * Handles dispatched event from sandbox.
 *
 * @method handle
 * @param {String} event
 * @param {Mixed} ...
 * @return {Connector}
 */
Connector.prototype.handle = function (event) {
	var args = [].slice.call(arguments, 1),
		listeners = this._listeners['$' + event];

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
Connector.prototype.listeners = function (event) {
	return this._listeners['$' + event] || [];
};

/**
 * Check if this connector has listeners.
 *
 * @method hasListeners
 * @param {String} event
 * @return {Boolean}
 */
Connector.prototype.hasListeners = function (event) {
	return !!this.listeners(event).length;
};

/**
 * Connect instance to the sandbox.
 *
 * @method connect
 * @return {Connector}
 */
Connector.prototype.connect = function () {
	if (!this._connected) {
		this._sandbox.addConnector(this);
		this._connected = true;
	}

	return this;
};

/**
 * Disconnect instance from the sandbox.
 *
 * @method disconnect
 * @return {Connector}
 */
Connector.prototype.disconnect = function () {
	if (this._connected) {
		this._sandbox.removeConnector(this);
		this._connected = false;
	}

	return this;
};


(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.T = factory();
  }
}(this, function() {
/*!
 * TerrificJS modularizes your frontend code by solely relying on naming conventions.
 * http://terrifically.org
 *
 * @copyright   Copyright (c) 2016 Remo Brunschwiler
 * @license     Licensed under MIT license
 * @version     3.0.0
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
/* global Sandbox, Utils, Module */
function Application(ctx, config) {
	// validate params
	if (!ctx && !config) {
		// both empty
		ctx = document;
		config = {};
	}
	else if (Utils.isNode(config)) {
		// reverse order of arguments
		var tmpConfig = config;
		config = ctx;
		ctx = tmpConfig;
	}
	else if (!Utils.isNode(ctx) && !config) {
		// only config is given
		config = ctx;
		ctx = document;
	}
	else if (Utils.isNode(ctx) && !config) {
		// only ctx is given
		config = {};
	}

	var defaults = {
		namespace: Module
	};

	config = Utils.extend(defaults, config);

	/**
	 * The context node.
	 *
	 * @property _ctx
	 * @type Node
	 */
	this._ctx = Utils.getElement(ctx);

	/**
	 * The configuration.
	 *
	 * @property config
	 * @type Object
	 */
	this._config = config;

	/**
	 * The sandbox to get the resources from.
	 * The singleton is shared between all modules.
	 *
	 * @property _sandbox
	 * @type Sandbox
	 */
	this._sandbox = new Sandbox(this);

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

	ctx = Utils.getElement(ctx) || this._ctx;

	this._sandbox.dispatch('t.register.start');

	// get module nodes
	var nodes = Utils.getModuleNodes(ctx);
	nodes.forEach(function (ctx) {

		/*
		 * A module can have different data attributes.
		 * See below for possible values.
		 */

		/*
		 * @config data-t-name="{mod-name}"
		 *
		 * Example: data-t-name="foo"
		 * Indicates that the module Foo should be bound.
		 */

		/*
		 * @config data-t-namespace="{namespace}"
		 *
		 * Example: data-t-namespace="App.Components"
		 * The namespace of the module. Optional.
		 */

		/*
		 * @config data-t-decorator="{decorator-name}"
		 *
		 * Example: data-t-decorator="bar"
		 * Indicates that the module Foo should be decorated with the Bar decorator.
		 * Multiple decorators should be comma-separated. Optional.
		 */
		var module = this.registerModule(ctx, ctx.getAttribute('data-t-name'), ctx.getAttribute('data-t-decorator'), ctx.getAttribute('data-t-namespace'));

		if (module) {
			modules[module._ctx.getAttribute('data-t-id')] = module;
		}
	}.bind(this));

	this._sandbox.dispatch('t.register.end');

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

	this._sandbox.dispatch('t.unregister.start');

	// unregister the given modules
	for (var id in modules) {
		if (this._modules.hasOwnProperty(id)) {
			if(Utils.isNode(this._modules[id]._ctx)) {
				this._modules[id]._ctx.removeAttribute('data-t-id');
			}
			delete this._modules[id];
		}
	}

	this._sandbox.dispatch('t.unregister.end');
};

/**
 * Starts (intializes) the registered modules.
 *
 * @method start
 * @param {Object} modules
 *      A collection of modules to start
 * @return {Promise}
 *      The synchronize Promise
 */
Application.prototype.start = function (modules) {
	modules = modules || this._modules;

	var promises = [];

	this._sandbox.dispatch('t.start');

	// start the modules
	for (var id in modules) {
		if (modules.hasOwnProperty(id)) {
			var promise = (function (id) {
				return new Promise(function (resolve, reject) {
                    modules[id].start(resolve, reject);
				});
			}(id));

			promises.push(promise);
		}
	}

	// synchronize modules
	var all = Promise.all(promises);
	all.then(function () {
		this._sandbox.dispatch('t.sync');
	}.bind(this)).catch(function (err) {
		throw err;
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

	this._sandbox.dispatch('t.stop');

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
 * @param {Array} decorators
 *      A list of decorator names. Each entry must match a class name of a decorator
 * @param {String} namespace
 *      The module namespace
 * @return {Module}
 *      The reference to the registered module
 */
Application.prototype.registerModule = function (ctx, mod, decorators, namespace) {
	var modules = this._modules;

	// validate params
	if(ctx.hasAttribute('data-t-id')) {
		return null; // prevent from registering twice
	}

	mod = Utils.capitalize(Utils.camelize(mod));

	if (Utils.isString(decorators)) {
		if (window[decorators]) {
			// decorators param is the namespace
			namespace = window[decorators];
			decorators = null;
		}
		else {
			// convert string to array
			decorators = decorators.split(',');
		}
	}
	else if (!Array.isArray(decorators) && Utils.isObject(decorators)) {
		// decorators is the namespace object
		namespace = decorators;
		decorators = null;
	}

	decorators = decorators || [];
	decorators = decorators.map(function (decorator) {
		return Utils.capitalize(Utils.camelize(decorator.trim()));
	});

	namespace = namespace || this._config.namespace;

	if (namespace[mod]) {
		// assign the module a unique id
		var id = this._id++;
		ctx.setAttribute('data-t-id', id);

		// instantiate module
		modules[id] = new namespace[mod](ctx, this._sandbox);

		// decorate it
		for (var i = 0, len = decorators.length; i < len; i++) {
			var decorator = decorators[i];

			if (namespace[mod][decorator]) {
				namespace[mod][decorator](modules[id]);
			}
		}

		return modules[id];
	}

	this._sandbox.dispatch('t.missing', ctx, mod, decorators, namespace);

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
	if (this._modules[id]) {
		return this._modules[id];
	}
	else {
		throw Error('The module with the id ' + id +
		' does not exist');
	}
};

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
 */
/* global Utils */
function Sandbox(application) {
	/**
	 * The application.
	 *
	 * @property _application
	 * @type Application
	 */
	this._application = application;

	/**
	 * Contains references to all module event emitters.
	 *
	 * @property _eventEmitters
	 * @type Array
	 */
	this._eventEmitters = [];
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
	var modules = {},
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
		var tmpModules = {};

		var nodes = Utils.getModuleNodes(modules);
		nodes.forEach(function (ctx) {
			// check for instance
			if (ctx.hasAttribute('data-t-id')) {
				var id = ctx.getAttribute('data-t-id');
				var module = this.getModuleById(id);

				if (module) {
					tmpModules[id] = module;
				}
			}
		}.bind(this));

		modules = tmpModules;
	}

	if(Utils.isObject(modules)) {
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
	return this._application._config;
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
	var config = this._application._config;

	if (config[name] !== undefined) {
		return config[name];
	}
	else {
		throw Error('The config param ' + name + ' does not exist');
	}
};

/**
 * Adds an event emitter instance.
 *
 * @method addEventEmitter
 * @param {EventEmitter} eventEmitter
 *      The event emitter
 * @return {Sandbox}
 */
Sandbox.prototype.addEventEmitter = function (eventEmitter) {
	this._eventEmitters.push(eventEmitter);
	return this;
};

/**
 * Removes an event emitter instance.
 *
 * @method addEventEmitter
 * @param {EventEmitter} eventEmitter
 *      The event emitter
 * @return {Sandbox}
 */
Sandbox.prototype.removeEventEmitter = function (eventEmitter) {
	var eventEmitters = this._eventEmitters;
	for (var i = 0, len = eventEmitters.length; i < len; i++) {
		if (eventEmitters[i] === eventEmitter) {
			eventEmitters.splice(i, 1);
			break;
		}
	}
	return this;
};

/**
 * Dispatches the event with the given arguments to the attached event emitters.
 *
 * @method dispatch
 * @param {Mixed} ...
 * @return {Sandbox}
 */
Sandbox.prototype.dispatch = function () {
	var eventEmitters = this._eventEmitters;

	for(var i = 0, len = eventEmitters.length; i < len; i++) {
		var eventEmitter = eventEmitters[i];
		if(eventEmitter !== undefined) {
			eventEmitter.handle.apply(eventEmitter, arguments);
		}
	}

	return this;
};
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

/**
 * Responsible for inter-module communication.
 * Classic EventEmitter Api. Heavily inspired by https://github.com/component/emitter
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class EventEmitter
 *
 * @constructor
 *
 * @param {Sandbox} sandbox
 *      The sandbox instance
 */
function EventEmitter(sandbox) {
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
 * @return {EventEmitter}
 */
EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (event, listener) {
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
 * @return {EventEmitter}
 */
EventEmitter.prototype.once = function (event, listener) {
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
 * @return {EventEmitter}
 */
EventEmitter.prototype.off = EventEmitter.prototype.removeListener = EventEmitter.prototype.removeAllListeners = function (event, listener) {
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
 * @return {EventEmitter}
 */
EventEmitter.prototype.emit = function () {
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
 * @return {EventEmitter}
 */
EventEmitter.prototype.handle = function (event) {
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
EventEmitter.prototype.listeners = function (event) {
	return this._listeners['$' + event] || [];
};

/**
 * Check if this event emitter has listeners.
 *
 * @method hasListeners
 * @param {String} event
 * @return {Boolean}
 */
EventEmitter.prototype.hasListeners = function (event) {
	return !!this.listeners(event).length;
};

/**
 * Connect instance to the sandbox.
 *
 * @method connect
 * @return {EventEmitter}
 */
EventEmitter.prototype.connect = function () {
	if (!this._connected) {
		this._sandbox.addEventEmitter(this);
		this._connected = true;
	}

	return this;
};

/**
 * Disconnect instance from the sandbox.
 *
 * @method disconnect
 * @return {EventEmitter}
 */
EventEmitter.prototype.disconnect = function () {
	if (this._connected) {
		this._sandbox.removeEventEmitter(this);
		this._connected = false;
	}

	return this;
};


/**
 * Utility functions.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Utils
 * @static
 */
/* global Module */
/* jshint unused: false */
var Utils = {
	/**
	 * Capitalizes the first letter of the given string.
	 *
	 * @method capitalize
	 * @param {String} str
	 *      The original string
	 * @return {String}
	 *      The capitalized string
	 */
	capitalize: function (str) {
		return str.substr(0, 1).toUpperCase().concat(str.substr(1));
	},

	/**
	 * Camelizes the given string.
	 *
	 * @method camelize
	 * @param {String} str
	 *      The original string
	 * @return {String}
	 *      The camelized string
	 */
	camelize: function (str) {
		return str.replace(/(\-[A-Za-z])/g, function ($1) {
			return $1.toUpperCase().replace('-', '');
		});
	},

	/**
	 * Check whether the given object is a string.
	 *
	 * @method isString
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	isString: function (obj) {
		return Object.prototype.toString.call(obj) === '[object String]';
	},

	/**
	 * Check whether the given param is an object.
	 *
	 * @method isObject
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	isObject: function (obj) {
		var type = typeof obj;
		return !!obj && (type === 'object' || type === 'function') && !Array.isArray(obj);
	},

	/**
	 * Check whether the given param is a function.
	 *
	 * @method isFunction
	 * @param {Object} obj
	 *      The object to check
	 * @return {Boolean}
	 */
	isFunction: function (obj) {
		var type = typeof obj;
		return !!obj && type === 'function';
	},

	/**
	 * Check whether the given param is a valid node.
	 *
	 * @method isNode
	 * @param {Node} node
	 *      The node to check
	 * @return {Boolean}
	 */
	isNode: function (node) {
		if (!node || !node.nodeType) {
			return false;
		}

		return node.nodeType === 1 || node.nodeType === 9;
	},

	/**
	 * Check whether the element matches the given selector.
	 *
	 * @method matches
	 * @param {Element} el
	 *      The element to check
	 * @param {String} selector
	 *        The selector to check against
	 * @return {Boolean}
	 */
	matches: function (el, selector) {
		var p = Element.prototype;
		var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function (s) {
				return [].slice.call(document.querySelectorAll(s)).indexOf(this) !== -1;
			};
		return f.call(el, selector);
	},

	/**
	 * Extends an object with the given objects.
	 *
	 * @method extend
	 * @param {Object} obj
	 *      The object to extend
	 * @param {Object} ...
	 * @return {Object} the extended object
	 */
	extend: function (obj) {
		if (!Utils.isObject(obj)) {
			return obj;
		}
		var source, prop;
		for (var i = 1, length = arguments.length; i < length; i++) {
			source = arguments[i];

			for (prop in source) {
				if (source.hasOwnProperty(prop)) {
					obj[prop] = source[prop];
				}
			}
		}
		return obj;
	},

	/**
	 * Get the element from a given node.
	 *
	 * @method getElement
	 * @param {Node} node
	 *      The node to check
	 * @return {Element}
	 */
	getElement: function (node) {
		if (!this.isNode(node)) {
			return null;
		}

		if (node.nodeType === 9 && node.documentElement) {
			return node.documentElement;
		}
		else {
			return node;
		}
	},

	/**
	 * Get the module nodes.
	 *
	 * @method getModuleNodes
	 * @param {Node} ctx
	 *      The ctx to check
	 * @return {Array}
	 */
	getModuleNodes: function (ctx) {
		var nodes = [].slice.call(ctx.querySelectorAll('[data-t-name]'));

		// check context itself
		if (this.matches(ctx, '[data-t-name]')) {
			nodes.unshift(ctx);
		}

		return nodes;
	},

	/**
	 * Creates a module class given a class specification.
	 *
	 * @method createModule
	 * @param {object} spec Class specification.
	 * @return {function} Module constructor function
	 */
	createModule: function (spec) {
		// validate params
		if (!spec || !Utils.isObject(spec)) {
			throw Error('Your module spec is not an object. Usage: T.createModule({ … })');
		}

		var Constructor = function (ctx, sandbox) {
			Module.call(this, ctx, sandbox);
		};

		var proto = Constructor.prototype = Object.create(Module.prototype);
		proto.constructor = Constructor;

		// apply statics
		if (spec.hasOwnProperty('statics')) {
			Utils.extend(Constructor, spec.statics);
		}

		// Ensure that stop is called even if the spec contains a custom stop function
		if (spec.hasOwnProperty('stop')) {
			proto.stop = function() {
				// Call the spec stop function
				spec.stop.apply(this, arguments);
				// Call the original stop function
				Module.prototype.stop.apply(this, arguments);
			};
		}

		var reservedKeys = [
			'statics',
			'stop'
		];

		// mixin spec properties to module prototype
		for (var name in spec) {
			if (!spec.hasOwnProperty(name)) {
				continue;
			}

			// check for reserved keys
			if (reservedKeys.indexOf(name) !== -1) {
				continue;
			}

			var property = spec[name];
			proto[name] = property;
		}

		return Constructor;
	},

	/**
	 * Creates a decorator given a decorator specification.
	 *
	 * @method createDecorator
	 * @param {object} spec Decorator specification.
	 * @return {function} Decorator function
	 */
	createDecorator: function (spec) {
		// validate params
		if (!spec || !Utils.isObject(spec)) {
			throw Error('Your decorator spec is not an object. Usage: T.createDecorator({ … })');
		}

		return function (orig) {
			var parent = {},
				name;

			// save references to original super properties
			for (name in orig) {
				if (Utils.isFunction(orig[name])) {
					parent[name] = orig[name].bind(orig);
				}
			}

			// override original properties and provide _parent property
			for (name in spec) {
				if (spec.hasOwnProperty(name)) {
					if(Utils.isFunction(spec[name])) {
						orig[name] = (function (name, fn) {
							return function () {
								this._parent = parent;
								return fn.apply(this, arguments);
							};
						}(name, spec[name]));
					}
					else {
						// simple property
						orig[name] = spec[name];
					}
				}
			}
		};
	}
};


/* global Application, Sandbox, Module, EventEmitter, Utils */
/* jshint unused: false */
var T = {
	Application: Application,
	Sandbox: Sandbox,
	Module: Module,
	EventEmitter: EventEmitter,
	createModule: Utils.createModule,
	createDecorator: Utils.createDecorator,
	version: '3.0.0'
};
return T;
}));

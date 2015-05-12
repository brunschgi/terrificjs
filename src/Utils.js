/**
 * Utility functions.
 *
 * @author Remo Brunschwiler
 * @namespace T
 * @class Utils
 * @static
 */
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
	isString: function(obj) {
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
	isObject : function (obj) {
		return obj === Object(obj);
	},

	/**
	 * Check whether the given param is a valid node.
	 *
	 * @method isNode
	 * @param {Node} node
	 *      The node to check
	 * @return {Boolean}
	 */
	isNode : function (node) {
		if(!node || !node.nodeType) {
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
 	 * 		The selector to check against
	 * @return {Boolean}
	 */
	matches: function(el, selector) {
		var p = Element.prototype;
		var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
			return [].slice.call(document.querySelectorAll(s)).indexOf(this) !== -1;
		};
		return f.call(el, selector);
	},

	/**
	 * Get the element from a given node.
	 *
	 * @method getElement
	 * @param {Node} node
	 *      The node to check
	 * @return {Element}
	 */
	getElement: function(node) {
		if(!this.isNode(node)) {
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
	getModuleNodes: function(ctx) {
		var nodes = [].slice.call(ctx.querySelectorAll('[data-t-name]'));

		// check context itself
		if(this.matches(ctx, '[data-t-name]')) {
			nodes.unshift(ctx);
		}

		return nodes;
	}
};

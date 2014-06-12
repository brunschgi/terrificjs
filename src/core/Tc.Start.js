/**
 * Terrific JavaScript Framework v<%= pkg.version %>
 * http://terrifically.org
 *
 * Copyright <%= grunt.template.today('yyyy') %>, Remo Brunschwiler
 * @license MIT Licensed.
 *
 * Date: <%= grunt.template.today() %>
 *
 *
 * Includes:
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 * @module Tc
 *
 */
(function(){

    var root = this, // save a reference to the global object
        Tc,
        $;

    if (typeof exports !== 'undefined') {
        Tc = exports;
    } else {
        Tc = root.Tc = {};
    }

    /*
     * The base library object.
     */
    $ = Tc.$ = root.jQuery || root.Zepto || root.$;

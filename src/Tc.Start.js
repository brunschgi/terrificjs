/*!
 * TerrificJS is a neat, clever piece of code that allows you to modularize your frontend code by solely relying on naming conventions.
 * http://terrifically.org
 *
 * @copyright   Copyright (c) <%= grunt.template.today('yyyy') %> Remo Brunschwiler
 * @license     Licensed under MIT license
 * @version     <%= pkg.version %>
 */

/**
 * @module Tc
 */
(function(){
    'use strict';

    var root = this, // save a reference to the global object
        Tc;

    if (typeof exports !== 'undefined') {
        Tc = exports;
    } else {
        Tc = root.Tc = {};
    }

    Tc.version = '<%= pkg.version %>';

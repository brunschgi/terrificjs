[TerrificJS](http://terrifically.org) - Terrific JavaScript Framework
=====================================================================

What is TerrificJS
------------------

TerrificJS is a neat, clever piece of code that allows you to modularize your frontend code by solely relying on naming conventions.

So simple, so effective! TerrificJS helps you to structure your project in a way you have never dreamt of. Try the magic and get addicted.

Notice: the documentation of TerrificJS is available at [http://terrifically.org/api](http://terrifically.org/api).


Build your own TerrificJS
-------------------------
* Install [Node.js](http://nodejs.org/)
* Open a terminal
* Make sure gulp is available globally `npm install -g gulp`
* Run `npm install`
* Run `bower install`
* Run `gulp`

You will get the following release artifacts:

* dist/docs/ – generated API documentation
* dist/terrific.js – the full release
* dist/terrific.min.js – the minified release for production use


Contribute
----------
TerrificJS makes it easy for you to change and test your own TerrificJS build.
* Run `gulp watch` and change any source you like

To test your build with karma / jasmine
* Make sure karma-cli is available globally `npm install -g karma-cli`
* Run `karma start` (comes with Chrome launcher)
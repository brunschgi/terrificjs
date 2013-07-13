[TerrificJS](http://terrifically.org) - Terrific JavaScript Framework
=====================================================================

What is TerrificJS
------------------

TerrificJS is a neat, clever piece of code that allows you to modularize your jQuery code by solely relying on CSS naming conventions.

So simple, so effective! TerrificJS helps you to structure your project in a way you have never dreamt of. Try the magic and get addicted.

Notice: the documentation of TerrificJS is available at [http://terrifically.org/api](http://terrifically.org/api).


Prerequisites for building your own TerrificJS
----------------------------------------------

* Ant (for the build execution)
* node.js (for UglifyJS, YUIDoc)
* npm (for UglifyJS, YUIDoc)
* UglifyJS
* YUIDoc

Notice: Some of the commands used below are Linux (Ubuntu) specific.


Installing Ant
--------------

First of all, you need Ant, if you do not already have those installed.

1. `sudo apt-get install ant`


Installing node.js and npm (Node Package Manager)
-------------------------------------------------

To get the build environment up and running, we need UglifyJS and YUIDoc, which itself depends on node.js.
Get appropriate installer package from [NodeJS](http://nodejs.org/).

Notice: npm comes bundled with node.js


Installing UglifyJS
-------------------

TerrificJS uses UglifyJS to build the minimized version of the JavaScript file. Install it via npm using the following command.

`npm -g install uglify-js`


Installing YUIDoc
-----------------

To generate the API documentation, the TerrificJS uses [YUIDoc](http://yui.github.com/yuidoc/) from Yahoo. Install it via npm using the following command.

`npm -g install yuidocjs`


Run Ant Build
-------------

To build your own release of Terrific, just run ant in the build directory and you’re done. The files will take place in the release folder in your TerrificJS working copy.

1. `cd /path/to/terrific/build`
2. `ant`


You will get the following release artifacts:

* release/docs/ – generated API documentation
* release/terrific-<version>.js – the full release
* release/terrific-<version>.min.js – the minified release for production use

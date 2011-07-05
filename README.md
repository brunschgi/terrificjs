[TerrificJS](http://terrifically.org) - Terrific JavaScript Framework
=====================================================================

What is TerrificJS
------------------

TerrificJS is a neat, clever piece of code that allows you to modularize your jQuery code by solely relying on the OOCSS naming conventions.

So simple, so effective! TerrificJS helps you to structure your project in a way you have never dreamt of. Try the magic and get addicted.

Notice: the documentation of TerrificJS is under heavy construction and will be available soon (probably end of June) at [http://terrifically.org](http://terrifically.org).


Prerequisites for building your own TerrificJS
----------------------------------------------

* Python (for node.js and Cheetah)
* Ant (for the build execution)
* node.js (for UglifyJS)
* npm (for UglifyJS)
* UglifyJS
* Cheetah (because of yuidoc)


Installing Python and Ant
--------------------------

Notice: This tutorial is for building TerrificJS on Linux (Ubuntu).

First of all, you need Python and Ant, if you do not already have those installed.

1. `sudo apt-get install python ant`


Installing node.js and npm (Node Package Manager)
-------------------------------------------------

To get the build environment up and running, we need UglifyJS, which itself depends on node.js. There are a several different methods available for installing [NodeJS](http://nodejs.org/). I chose the following method because I had problems with the packages from the official repository and the one from node.js.

1. `sudo mkdir -p /usr/local/{share/man,bin,lib/node,include/node}`
2. `sudo chown -R $USER /usr/local/{share/man,bin,lib/node,include/node`}
3. `mkdir node-install`
4. `curl http://nodejs.org/dist/node-v0.4.7.tar.gz | tar -xzf - -C node-install`
5. `cd node-install/*`
6. `./configure`
7. `make install`
8. `curl http://npmjs.org/install.sh | sh`


Installing UglifyJS
-------------------

As mentioned before, Terrific uses UglifyJS to build the minimized version of the Javascript file. Install it via npm using the following commands.

1. `npm install uglify-js
2. `sudo ln -s /home/$USER/node-install/node-v0.4.7/node_modules/uglify-js/bin/uglifyjs /usr/bin/uglifyjs


Installing Cheetah (for yuidoc)
-------------------------------

To generate the API documentation, the project uses yuidoc from Yahoo. To get this one running, we need to install the python-powered template engine Cheetah.

1. `wget http://pypi.python.org/packages/source/C/Cheetah/Cheetah-2.4.4.tar.gz`
2. `tar xvfz Cheetah-2.4.4.tar.gz`
3. `cd Cheetah-2.4.4`
4. `sudo python setup.py install`


Run Ant Build
-------------

To build your own release of Terrific, just run ant in the build directory and you’re done. The files will take place in the release folder in your TerrificJS working copy.

1. `cd /path/to/terrific/build`
2. `ant`


You will get the following release artifacts:

* release/docs/ – generated API documentation
* release/terrific-1.0.0.js – the full release
* release/terrific-1.0.0.min.js – the minified release for production use

– thx to [Roger Dudler](https://github.com/rogerdudler) for writing this tutorial –

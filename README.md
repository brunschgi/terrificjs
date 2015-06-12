[![Build Status](https://travis-ci.org/brunschgi/terrificjs.svg)](https://travis-ci.org/brunschgi/terrificjs)

# Terrific JavaScript Framework
## What is TerrificJS
TerrificJS is a neat, clever piece of code that allows you to modularize your frontend code by solely relying on naming conventions.
So simple, so effective! Its your perfect JS buddy if you are working with a «modularization philosophy» like [Atomic Design](http://bradfrost.com/blog/post/atomic-web-design/) in mind.

Btw: It's productively being used on many high traffic sites and applications – e.g. [freitag.com](http://www.freitag.com), [swisscom.ch](http://www.swisscom.com), [sbb.ch](http://www.sbb.ch), [frontify.com](http://frontify.com) & many many more.

## Content
- [Installation](#installation)
- [Quickstart](#quickstart)
- [Usage](#usage)
     - [Modules](#modules)
     - [Decorators](#decorators)
     - [EventEmitter](#eventemitter)
     - [Bootstrap Application](#bootstrap-application)
     - [Lifecycle Events](#lifecycle-events)
     - [Sandbox](#sandbox)
- [Advanced Usage](#advanced-usage)
- [Build your own TerrificJS](#build-your-own-terrificjs)

## Installation
Install the package as a bower component

    bower install terrific

### ES5 & ES6 Promise
Terrific depends on an es5-shim for older browsers. [kriskowal's es5-shim](https://github.com/kriskowal/es5-shim) provides everything required.
Moreover it uses ES6 Promises. [jakearchibald's  es6-promise](https://github.com/jakearchibald/es6-promise) does the trick.

If you have installed terrific as a bower component, these dependencies are already included.

## Examples
You can find some examples on Codepen

- [Simple Search Module](http://codepen.io/brunschgi/pen/waGdaM)

## Quickstart
Making your Terrific application up and running is a simple 3 step process.

1. Create your modules
2. Annotate your markup
3. Boostrap your application

### 1. Create your modules
Create your modules by using `T.createModule({ … })`

```js
T.Module.Foo = T.createModule({
	start: function(resolve) {
	  // your logic goes here

	  resolve();
	}
});
```

### 2. Annotate your markup
Drop `terrific.js` to your page and annotate your markup by using the `data-t-name` attribute, eg. for the molecule foo`

```html
<!DOCTYPE html>
<html>
<head></head>
<body>
	<div data-t-name="Foo">
      …
    </div>
	<script src="bower_components/terrific/dist/terrific.min.js"></script>
</body>
</html>
```

### 3. Bootstrap your application
Bootstrap your application (at the end of the page or when the document is ready)

```js
var application = new T.Application();
application.registerModules();
application.start();
```

## Usage
### Modules
Modules are the real stars of your TerrificJS application. All of your JavaScript code will find its place in one of the modules. In regard to this fact you will find yourself spending most of your time writing modules.

The module API is very easy and consists of 2 lifecycle methods – `start()` and `stop()`

```js
T.Module.Foo = T.createModule({
	start: function(resolve) {
		// your logic goes here -> executed on application.start()

		// use this._ctx – contains the DOM Element with the `data-t-name` attribute – to encapsulate your logic;
		// e.g. $(this._ctx).find('.js-foo`)

		// use this._sandbox to access the shared – among all modules – `Sandbox` instance;
		// e.g. this._sandbox.getConfig();

		// use this_events – contains an EventEmitter instance – to communicate with the «outside», e.g. other modules;
		// e.g. this._events.emit('foo', …);

		resolve();
	},
	stop: function() {
		// optional -> tidy up your module. Called on application.stop()

		// e.g. this._events.disconnect(); -> disconnect from the event dispatcher
	}
});
```

To get your module instantiated with the correct `this._ctx` you have to annotate your markup with the `data-t-name` attribute.

```html
<div data-t-name="Foo">…</div>
```

### Decorators
Decorators allow you to extend the functionality of your modules.

#### Example
Create Module

```js
var T.Module.Foo = T.createModule({
    value: 'foo',
    start : function (resolve, reject) {
         resolve()
    },
    foo: function() {
       return 'foo';
    }
});
```

Create Decorator

```js
T.Module.Foo.Bar = T.createDecorator({
     /* override property */
     value: 'bar',
     /* extended (decorated) lifecycle method */
     start : function (resolve, reject) {
          this._parent.start(resolve, reject);
     },
     /* new method */
     bar : function () {
         return "bar";
     },
     /* extended (decorated) method */
     foo : function () {
         var value = this._parent.foo();
         return 'bar-'+ value;
     }
});
```

Usage

```js
var module = application.registerModule(document.createElement('div'), 'Foo', ['Bar']);

module.bar(); // -> bar
module.foo(); // -> bar-foo
module.value; // -> bar (as we are decorating and not inheriting from the module, the property gets overridden)
module.start(); // -> executes the start from the decorator and the module
```

Basically the `this._parent` property allows you to call all methods from the decorated module.
Mention: as we are decorating and not inheriting from the module, all properties gets overridden directly on the instance.

To get your module decorated by the proper decorator you have to annotate your markup with the `data-t-decorator` attribute.

```html
<div data-t-name="Foo" data-t-decorator="Bar">…</div>
```

### EventEmitter
The `EventEmitter` allows your module to communicate with the outside (e.g. other modules).
To provide proper module encapsulation, every module comes with an own `EventEmitter` instance – bound on `this._events`. All emitted events are being dispatched over the `Sandbox` to the other `EventEmitter` instances.

The `EventEmitter` API is strongly related to the NodeJS [EventEmitter API](https://nodejs.org/api/events.html#events_class_events_eventemitter).
The following methods are supported

#### emit(event, ...)
Emits an `event` with variable option args.

#### on(event, fn) / addListener(event, fn)
Registers an `event` handler `fn`.

#### once(event, fn)
Registers a single-shot `event` handler `fn`, removed immediately after it is invoked the first time.

#### off(event, fn) / removeListener(event, fn) / removeAllListeners(event, fn)
- Pass `event` and `fn` to remove a listener.
- Pass `event` to remove all listeners on that event.
- Pass nothing to remove all listeners on all events.

#### listeners(event)
Returns an array of callbacks, or an empty array.

#### hasListeners(event)
Checks if this emitter has `event` handlers.

#### Example
```js
T.Module.Foo = T.createModule({
	start: function(resolve) {
		this._events.on('foo', function() {
			// do something
		});

		resolve();
	}
});
```

### Bootstrap Application
The bootstrap kickstarts the engine of your Application and saves you from tedious work by wiring up your components automatically.
Place the bootstrap code at the end of your page (or when the document is ready).

```js
var application = new T.Application(); // creates a new application context
application.registerModules(); // registers all – eventually decorated –  modules by using the `data-t-name` and `data-t-decorator` attributes.
application.start(); // starts the application by calling `start()` on each registered module instance
```

This is the most basic form of the application bootstrap. Optionally you can extend the bootstrap and tailor it to your needs.


#### Specific application context
Create a new application for a specific part of the page

```js
var application = new T.Application(document.getElementById('my-app'));
application.registerModules(); // only considers elements inside the <div id="my-app"></div>

```

Alternatively you could also do

```js
var application = new T.Application();
application.registerModules(document.getElementById('my-app')); // only considers elements inside the <div id="my-app"></div>

```

#### Global config
Pass in a global configuration object (accessible over the shared [`Sandbox`](#sandbox) instance).

```js
var application = new T.Application({ foo: 'bar', bar : 'foo' });
```

#### Register module manually
Register the module `Foo` – decorated with the decorator `Bar` – on the DOM element with `id="foo"`.

```js
var application = new T.Application();
application.registerModule(document.getElementById('foo'), 'Foo', ['Bar']);
```

### Lifecycle Events
Lifecycle events offers the possibility to listen and react on some application internals by using `EventEmitter`.
Supported lifecycle events

- `t.register.start` => emitted when `application.registerModules()` is started
- `t.missing` with params ctx, name, decorators => emitted for each module that cannot be found
- `t.register.end` => emitted when `application.registerModules()` is ended

=> The above 3 could e.g. be used to collect all missing modules and lazy load them on demand

- `t.start` => emitted when the modules are started
- `t.sync` => emitted when the start method of all modules has been run (replacement of the former `after` hook)
- `t.stop` => emitted when the modules are stopped
- `t.unregister.start` => emitted when `application.unregisterModules()` is started
- `t.unregister.end` => emitted when `application.unregisterModules()` is ended

#### Example
Listen to the `t.sync` lifecycle event to make sure that all modules have added their listeners before emitting an event

```js
T.Module.Foo = T.createModule({
	start: function (resolve) {
		this._events.on('t.sync', this.sync.bind(this));

		resolve();
	},
	sync: function () {
		this._events.emit('foo');
	}
});

T.Module.Bar = T.createModule({
	start: function (resolve) {
		this._events.on('foo', function() {
			// do something
		});

		resolve();
	}
});
```

### Sandbox
The `Sandbox` instance is shared among all modules and allows them to communicate with the application.
Every module can access the sandbox over the `this._sandbox` property.

Supported methods

#### addModules(ctx)
Add modules – contained in the `ctx` DOM Element – to the application

#### removeModules(ctx)
- ctx == DOM Element: Remove all modules – contained in the `ctx` DOM Element – from the application
- ctx == Module collection (return value from `addModules`): Remove given modules from the application

#### getModuleById(id)
Returns the module instance for the given id (id = value of `data-t-id` attribute)

#### getConfig()
Returns the global config

#### getConfigParam(name)
Returns the appropriate config param


## Advanced Usage
### Change T.Module Namespace

The application bootstrap looks for module and decorator definitions in the `T.Module` namespace, e.g. `T.Module.Foo`.
The namespace can be changed either for individual or for all modules.

#### Individual module
Create module in different namespace, e.g. `App.Component`.

```js
App.Component.Foo = T.createModule({
	start: function (resolve) {
		…

		resolve();
	}
});
```

Annotate your markup by using the `data-t-namespace` attribute

```html
<div data-t-name="Foo" data-t-namespace="App.Component">
…
</div>
```

#### All modules
Its quite tedious to blow up your markup by adding the `data-t-namespace` attribute to each single module .

Change the default namespace in the global config.

```js
var application = new T.Application({ namespace: 'App.Component' });
```

### Use EventEmitter outside modules
The `EventEmitter` can also be used to communicate with modules from non-module context, e.g. from the application bootstrap.

```js
var application = new T.Application();

var emitter = new T.EventEmitter(application._sandbox);
emitter.on('t.sync', function() {
	emitter.emit('foo');
});

application.registerModules();
application.start();

```

### Build your own TerrificJS
- Install [Node.js](http://nodejs.org/)
- Open a terminal
- Make sure gulp is available globally `npm install -g gulp`
- Run `npm install`
- Run `bower install`
- Run `gulp`

You will get the following release artifacts

- dist/docs/ – generated API documentation
- dist/terrific.js – the full release
- dist/terrific.min.js – the minified release for production use
- dist/terrific.min.js.map – sourcemaps
- terrific.d.ts and dist/es6-promise.d.ts – typescript definition


TerrificJS makes it easy for you to change and test your own TerrificJS build.
- Run `gulp watch` and change any source you like

To test your build with [PhantomJS](http://phantomjs.org/)
- Run `npm test`

To test your build in a real browser environment
- Make sure karma-cli is available globally `npm install -g karma-cli`
- Run `karma start` (comes with Chrome launcher)

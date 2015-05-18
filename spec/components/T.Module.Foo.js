/* Foo */
Foo = function(ctx, sandbox) {
	T.Module.call(this, ctx, sandbox);
};

Foo.prototype = Object.create(T.Module.prototype);
Foo.prototype.constructor = Foo;

T.Module.Foo = Foo;


/* FooStart */
FooStart = function(ctx, sandbox) {
	T.Module.call(this, ctx, sandbox);
};

FooStart.prototype = Object.create(T.Module.prototype);
FooStart.prototype.constructor = FooStart;

FooStart.prototype.start = function() {
};

T.Module.FooStart = FooStart;


// Skins
T.Module.Foo.Bar = function (module) {
	var start = module.start;
	module.start = function () {
		start.call(module);
	};

	module.bar = function () {
		return "bar";
	};
};

T.Module.Foo.FooBar = function (module) {
	var start = module.start;
	module.start = function () {
		start.call(module);
	};

	module.foobar = function () {
		return "foobar";
	};
};
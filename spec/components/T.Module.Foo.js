/* Foo */
T.Module.Foo = T.createModule({ name: 'Foo' });


/* FooStart */
T.Module.FooStart = T.createModule({
	name: 'FooStart',
	start: function(resolve) {
		resolve();
	}
});


// Skins
T.Module.Foo.Bar = function (module) {
	var start = module.start.bind(module);
	module.start = function (resolve, reject) {
		start(resolve, reject);
	};

	module.bar = function () {
		return "bar";
	};
};

T.Module.Foo.FooBar = function (module) {
	var start = module.start.bind(module);
	module.start = function (resolve, reject) {
		start(resolve, reject);
	};

	module.foobar = function () {
		return "foobar";
	};
};
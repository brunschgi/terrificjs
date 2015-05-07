Foo = function(ctx, sandbox) {
	T.Module.call(this, ctx, sandbox);
};

Foo.prototype = Object.create(T.Module.prototype);
Foo.prototype.constructor = Foo;

Foo.prototype.bar = function() {
	return 'bar';
};

App = {
	Components : {

	}
};

App.Components.Foo = Foo;


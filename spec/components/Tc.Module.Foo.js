Tc.Module.Foo = Tc.Module.extend({
	init: function(ctx, sandbox, id) {
		// call base constructor
		this._super(ctx, sandbox, id);
	}
});

Tc.Module.FooOn = Tc.Module.extend({
	init: function(ctx, sandbox, id) {
		// call base constructor
		this._super(ctx, sandbox, id);
	},

	on: function(callback) {
		callback();
	}
});

Tc.Module.FooAfter = Tc.Module.extend({
	init: function(ctx, sandbox, id) {
		// call base constructor
		this._super(ctx, sandbox, id);
	},

	after: function() {
	}
});

Tc.Module.FooBoth = Tc.Module.extend({
	init: function(ctx, sandbox, id) {
		// call base constructor
		this._super(ctx, sandbox, id);
	},

	on: function(callback) {
		callback();
	},

	after: function() {
	}
});

// Skins
Tc.Module.Foo.Bar = function(module) {
	var on = module.on;

	module.on = function(callback) {
		on(callback);
	};

	module.bar = function() {
		return "bar";
	};
};

Tc.Module.Foo.FooBar = function(module) {
	var on = module.on;

	module.on = function(callback) {
		on(callback);
	};

	module.foobar = function() {
		return "foobar";
	};
};
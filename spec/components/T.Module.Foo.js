/* Foo */
T.Module.Foo = T.createModule({
	value: 'foo',
	foo: function() {
		return 'foo';
	},
	get : function () {
		return this.value;
	}
});


/* FooStart */
T.Module.FooStart = T.createModule({
	start: function(resolve) {
		resolve();
	}
});


// Skins
T.Module.Foo.Bar = T.createSkin({
	value: 'bar',
	start : function (resolve, reject) {
		this._parent.start(resolve, reject);
	},

	bar : function () {
		return "bar";
	},

	foo : function () {
		var value = this._parent.foo();
		return 'bar-foo|' + value;
	},

	get : function () {
		var value = this._parent.get();
		return this.value + '|' + value;
	}
});

T.Module.Foo.FooBar = T.createSkin({
	value: 'foobar',
	start : function (resolve, reject) {
		this._parent.start(resolve, reject);
	},

	foobar : function () {
		return "foobar";
	},

	foo : function () {
		var value = this._parent.foo();
		return 'foobar-foo|' + value;
	},

	get : function () {
		var value = this._parent.get();
		return this.value + '|' + value;
	}
});

describe('Utils', function () {
	'use strict';

	describe('createModule(spec)', function () {
		it('should throw an error if no spec is given', function () {
			expect(function () {
				T.createModule();
			}).toThrow();
		});

		it('should not throw an error if a valid spec is given', function () {
			expect(function () {
				T.createModule({});
			}).not.toThrow();
		});

		it('should return module constructor function', function () {
			var Module = T.createModule({});
			expect(Module instanceof Function).toBeTruthy();
		});

		it('should allow creation of prototype properties', function () {
			var Module = T.createModule({
				foo: 'foo',
				bar: function() {
					return 'bar';
				}
			});

			expect(new Module().foo).toEqual('foo');
			expect(new Module().bar()).toEqual('bar');
		});


		it('should allow creation of static properties', function () {
			var Module = T.createModule({
				name: 'Foo',
				statics: {
					foo: function () {
						return 'foo';
					},
					bar: 'bar'
				}
			});

			expect(Module.foo()).toEqual('foo');
			expect(Module.bar).toEqual('bar');
		});

		it('should deconstruct the module when calling stop', function () {
			var Module = T.createModule({
				name: 'Foo'
			});
			var instance = new Module({}, {});
			spyOn(T.Module.prototype, 'stop');
			instance.stop();
			expect(T.Module.prototype.stop).toHaveBeenCalled();
		});

		it('should always deconstruct the module also if a custom stop function exists', function () {
			var Module = T.createModule({
				name: 'Foo',
				stop: function() {}
			});
			var instance = new Module({}, {});
			spyOn(T.Module.prototype, 'stop');
			instance.stop();
			expect(T.Module.prototype.stop).toHaveBeenCalled();
		});
	});
});


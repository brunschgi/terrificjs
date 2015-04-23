describe('Module', function () {
	'use strict';

    it('should be instance of T.Module', function () {
		var module = new T.Module(document.createElement('div'), new T.Sandbox(), 1);
        expect(module instanceof T.Module ).toBeTruthy();
    });

    it('should set instance variables', function () {
        var ctx = document.createElement('div');
        var sandbox = new T.Sandbox();
        var module = new T.Module(ctx, sandbox);

        expect(module._ctx).toEqual(ctx);
        expect(module._sandbox).toEqual(sandbox);
    });

    describe('.start()', function () {
        it('should return Promise', function () {
			var module = new T.Module.Foo(document.createElement('div'), new T.Sandbox(), 1);
            var promise = module.start();

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should not throw an error if no callbacks are provided', function () {
			var module = new T.Module.Foo(document.createElement('div'), new T.Sandbox(), 1);

            expect(function() {
                module.start();
            }).not.toThrow();
        });

        it('should not throw an error if only the after callback is provided', function () {
			var module = new T.Module.FooAfter(document.createElement('div'), new T.Sandbox(), 1);

            expect(function() {
                module.start();
            }).not.toThrow();
        });

        it('should not throw an error if only the on callback is provided', function () {
			var module = new T.Module.FooOn(document.createElement('div'), new T.Sandbox(), 1);

            expect(function() {
                module.start();
            }).not.toThrow();
        });

        it('should call after callback if no on callback is provided', function (done) {
			var module = new T.Module.FooAfter(document.createElement('div'), new T.Sandbox(), 1);

            spyOn(module, 'after');

            var promise = module.start();

            promise.then(function(callback) {
                callback();
                expect(module.after).toHaveBeenCalled();
                done();
            });
        });

        it('should call on and after callbacks if both are provided', function (done) {
			var module = new T.Module.FooBoth(document.createElement('div'), new T.Sandbox(), 1);

            spyOn(module, 'on').and.callThrough();
            spyOn(module, 'after');

            var promise = module.start();

            promise.then(function(callback) {
                callback();
                expect(module.on).toHaveBeenCalled();
                expect(module.after).toHaveBeenCalled();
                done();
            });
        });
    });
});


'use strict';

describe('Module', function () {

    it('should be instance of Tc.Module', function () {
        var module = new Tc.Module();
        expect(module instanceof Tc.Module ).toBeTruthy();
    });

    it('should set instance variables', function () {
        var ctx = document.createElement('div');
        var sandbox = new Tc.Sandbox();
        var id = 1;
        var module = new Tc.Module(ctx, sandbox, id);

        expect(module.ctx).toEqual(ctx);
        expect(module.sandbox).toEqual(sandbox);
        expect(module.id).toEqual(id);
    });

    describe('start', function () {
        it('should return Promise', function () {
            var module = new Tc.Module.Foo();
            var promise = module.start();

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should not throw an error if no callbacks are provided', function () {
            var module = new Tc.Module.Foo();

            expect(function() {
                module.start()
            }).not.toThrow();
        });

        it('should not throw an error if only the after callback is provided', function () {
            var module = new Tc.Module.FooAfter();

            expect(function() {
                module.start()
            }).not.toThrow();
        });

        it('should not throw an error if only the on callback is provided', function () {
            var module = new Tc.Module.FooOn();

            expect(function() {
                module.start()
            }).not.toThrow();
        });

        it('should call after callback if no on callback is provided', function (done) {
            var module = new Tc.Module.FooAfter();
            spyOn(module, 'after');

            var promise = module.start();

            promise.then(function(callback) {
                callback();
                expect(module.after).toHaveBeenCalled();
                done();
            });
        });

        it('should call on and after callbacks if both are provided', function (done) {
            var module = new Tc.Module.FooBoth();
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


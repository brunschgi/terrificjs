describe('Module', function () {
	'use strict';

    it('should be instance of T.Module', function () {
		var module = new T.Module(document.createElement('div'), new T.Sandbox());
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
        it('should not throw an error if the start and stop methods are missing', function () {
			var module = new T.Module.Foo(document.createElement('div'), new T.Sandbox());

            expect(function() {
                module.start(function() {});
            }).not.toThrow();
        });
    });
});


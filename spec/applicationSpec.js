describe('Application', function () {
	'use strict';

    it('should be instance of T.Application', function () {
        var application = new T.Application();
        expect(application instanceof T.Application ).toBeTruthy();
    });

    it('should have default ctx when called with no args', function () {
        var application = new T.Application();
        expect(application._ctx).toEqual(document);
    });

    it('should have default ctx when called with config only', function () {
        var config = { 'foo' : 'bar'};
        var application = new T.Application(config);
        expect(application._ctx).toEqual(document);
    });

    it('should support normal order of constructor arguments', function () {
        var config = { 'foo' : 'bar'};
        var el = document.createElement('div');
        var application = new T.Application(el, config);
        expect(application._ctx).toEqual(el);
    });

    it('should support reverse order of constructor arguments', function () {
        var config = { 'foo' : 'bar'};
        var el = document.createElement('div');
        var application = new T.Application(config, el);
        expect(application._ctx).toEqual(el);
    });

    describe('.registerModules(ctx)', function() {
        beforeEach(function () {
            this.application = new T.Application();
            this.ctx = document.createElement('div');
            this.id = 1;
            spyOn(this.application, 'registerModule').and.callFake(function() {
                return { id : this.id++ };
            }.bind(this));
        });

        it('should register module on ctx node', function () {
            this.ctx.setAttribute('data-t-name', 'Foo');
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(1);
            expect(this.application.registerModule).toHaveBeenCalledWith(this.ctx, 'Foo', []);
            expect(Object.keys(modules).length).toEqual(1);

        });

        it('should register module on child node', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(1);
            expect(this.application.registerModule).toHaveBeenCalledWith(this.ctx.firstChild, 'Foo', []);
            expect(Object.keys(modules).length).toEqual(1);
        });

        it('should register multiple modules on sibling nodes', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"></div><div data-t-name="Foo"></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(2);
            expect(Object.keys(modules).length).toEqual(2);
        });

        it('should register multiple modules on nested nodes', function () {
            this.ctx.innerHTML = '<div data-t-name="Foo"><div data-t-name="Foo"></div></div>';
            var modules = this.application.registerModules(this.ctx);

            expect(this.application.registerModule.calls.count()).toEqual(2);
            expect(Object.keys(modules).length).toEqual(2);
        });

		describe('should emit lifecycle event', function () {
			beforeEach(function() {
				this.connector = new T.Connector(this.application._sandbox);
			});

			it('t.register.start without arguments', function (done) {
				this.connector.on('t.register.start', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.registerModules(this.ctx);
			});

			it('t.register.end without arguments', function (done) {
				this.connector.on('t.register.end', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.registerModules(this.ctx);
			});
		});
    });

    describe('.unregisterModules()', function() {
		beforeEach(function () {
			this.application = new T.Application();
		});

		it('should unregister all modules', function () {
			this.application._modules = {1: true, 2: true, 3: true};
			this.application.unregisterModules();

			expect(Object.keys(this.application._modules).length).toEqual(0);
		});

		describe('should emit lifecycle event', function () {
			beforeEach(function() {
				this.connector = new T.Connector(this.application._sandbox);
			});

			it('t.unregister.start without arguments', function (done) {
				this.connector.on('t.unregister.start', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.unregisterModules();
			});

			it('t.unregister.end without arguments', function (done) {
				this.connector.on('t.unregister.end', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.unregisterModules();
			});
		});
	});

	describe('.unregisterModules(modules)', function() {
		beforeEach(function () {
			this.application = new T.Application();
		});

        it('should unregister the given modules', function () {
            this.application._modules = { 1 : true, 2 : true, 3: true};
            this.application.unregisterModules({ 1 : true, 2: true});

            expect(Object.keys(this.application._modules).length).toEqual(1);
            expect(this.application._modules[3]).toBeDefined();
        });

		describe('should emit lifecycle event', function () {
			beforeEach(function() {
				this.connector = new T.Connector(this.application._sandbox);
			});

			it('t.unregister.start without arguments', function (done) {
				this.connector.on('t.unregister.start', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.unregisterModules();
			});

			it('t.unregister.end without arguments', function (done) {
				this.connector.on('t.unregister.end', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.unregisterModules();
			});
		});
    });

    describe('.getModuleById(id)', function() {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should throw an error for undefined id', function () {
            expect(function() {
                this.application.getModuleById();
            }.bind(this)).toThrow();
        });

        it('should not throw an error for invalid id', function () {
            expect(function() {
                this.application.getModuleById(1);
            }.bind(this)).toThrow();
        });

        it('should return registered module instance', function () {
            this.application._modules = { 3 : true};
            var instance = this.application.getModuleById(3);
            expect(instance).toBeTruthy();
        });

        it('should cast the id', function () {
            this.application._modules = { 3 : true};
            var instance = this.application.getModuleById('3');
            expect(instance).toBeTruthy();
        });
    });

    describe('.registerModule(ctx, mod, skins)', function() {
        beforeEach(function () {
			this.application = new T.Application();
            this.ctx = document.createElement('div');
        });

        it('should allow to be called with ctx and module name only', function () {
            expect(function() {
                this.application.registerModule(this.ctx, 'DoesNotExist');
            }.bind(this)).not.toThrow();
        });

        it('should return null if the module does not exists', function () {
            var module = this.application.registerModule(this.ctx, 'DoesNotExist');
            expect(module).toBeNull();
        });

		it('should emit lifecycle event t.missing if the module does not exists', function (done) {
			var connector = new T.Connector(this.application._sandbox);

			connector.on('t.missing', function(ctx, mod, skins) {
				expect(ctx).toEqual(this.ctx);
				expect(mod).toEqual('DoesNotExist');
				expect(skins).toEqual([]);
				done();
			}.bind(this));

			this.application.registerModule(this.ctx, 'DoesNotExist');
		});

		it('should return module instance if module does exists', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(module instanceof T.Module).toBeTruthy();
        });

        it('should assign ctx node and sandbox to the module instance', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(module._ctx instanceof Node).toBeTruthy();
            expect(module._sandbox instanceof T.Sandbox).toBeTruthy();
        });

        it('should set data-t-id on the ctx node', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');
            expect(Number(module._ctx.getAttribute('data-t-id'))).toEqual(1);
        });

        it('should have default on and after callbacks', function () {
            var module = this.application.registerModule(this.ctx, 'Foo');

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.on).toBeDefined();
            expect(module.on).toBeDefined();
        });

        it('should not do anything if skin does not exists', function () {
            var module;

            expect(function() {
                module = this.application.registerModule(this.ctx, 'Foo', ['DoesNotExists']);
            }.bind(this)).not.toThrow();

            expect(module instanceof T.Module.Foo).toBeTruthy();
        });

        it('should decorate the module if skin does exists', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
        });

        it('should decorate the module with multiple skins', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar', 'FooBar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();
            expect(module.bar()).toEqual('bar');
            expect(module.foobar).toBeDefined();
            expect(module.foobar()).toEqual('foobar');
        });

        it('should not throw an error if on callback does not exist on decorated module', function () {
            var module = this.application.registerModule(this.ctx, 'Foo', ['Bar']);

            expect(module instanceof T.Module.Foo).toBeTruthy();
            expect(module.bar).toBeDefined();

            expect(function() {
                module.start();
            }).not.toThrow();
        });

        it('should increment the module id counter by one with every call', function () {
			var ctx1 = document.createElement('div');
			var ctx2 = document.createElement('div');
			var ctx3 = document.createElement('div');

            this.application.registerModule(ctx1, 'Foo');
            this.application.registerModule(ctx2, 'Foo');
            this.application.registerModule(ctx3, 'Foo');

            expect(Number(ctx1.getAttribute('data-t-id'))).toEqual(1);
            expect(Number(ctx2.getAttribute('data-t-id'))).toEqual(2);
            expect(Number(ctx3.getAttribute('data-t-id'))).toEqual(3);
        });
    });

    describe('.start()', function() {
        beforeEach(function () {
            this.application = new T.Application();
        });

        it('should return Promise if no modules are given', function () {
            var promise = this.application.start();

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should return Promise if valid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function() {
                return new Promise(function(resolve) {
                    resolve();
                });
            });
            var modules = { 1 : module, 2 : module };

            var promise = this.application.start(modules);

            expect(promise instanceof Promise).toBeTruthy();
        });

        it('should throw an error if invalid modules are given', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function() {
                return {};
            });
            var modules = { 1 : module, 2 : module };

            expect(function() {
                this.application.start(modules);
            }).toThrow();
        });

        it('should call start on the given modules', function () {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function() {
                return new Promise(function(resolve) {
                    resolve();
                });
            });
            var modules = { 1 : module, 2 : module };

            this.application.start(modules);

            expect(module.start.calls.count()).toEqual(2);
        });

		it('should execute then callback if no modules are given', function (done) {
            var promise = this.application.start();

            promise.then(function(callbacks) {
                expect(callbacks.length).toEqual(0);
                done();
            });
        });

        it('should execute then callback if all modules are resolved', function (done) {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function() {
                return new Promise(function(resolve) {
                    resolve();
                });
            });
            var modules = { 1 : module, 2 : module };
            var promise = this.application.start(modules);

            promise.then(function(callbacks) {
                expect(callbacks.length).toEqual(2);
                done();
            });
        });

        it('should execute catch block if all modules are rejected', function (done) {
            var module = jasmine.createSpyObj('module', ['start']);
            module.start.and.callFake(function() {
                return new Promise(function(resolve, reject) {
                    reject('fail');
                });
            });
            var modules = { 1 : module, 2 : module };
            var promise = this.application.start(modules);

            promise.catch(function(error) {
                expect(error).toEqual('fail');
                done();
            });
        });

		describe('should emit lifecycle event', function () {
			beforeEach(function() {
				this.connector = new T.Connector(this.application._sandbox);
			});

			it('t.on without arguments', function (done) {
				this.connector.on('t.on', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.start();
			});

			it('t.after without arguments', function (done) {
				this.connector.on('t.after', function(args) {
					expect(args).toBeUndefined();
					done();
				});

				this.application.start();
			});
		});
    });

    describe('.stop()', function() {
		beforeEach(function () {
			this.application = new T.Application();
		});

		it('should call stop on the given modules', function () {
			var module = jasmine.createSpyObj('module', ['stop']);
			var modules = { 1 : module, 2 : module };

			this.application.stop(modules);

			expect(module.stop.calls.count()).toEqual(2);
		});

		it('should emit lifecycle event t.stop', function (done) {
			var connector = new T.Connector(this.application._sandbox);

			connector.on('t.stop', function(args) {
				expect(args).toBeUndefined();
				done();
			}.bind(this));

			this.application.stop();
		});
	});
});



(function($) {
    $(document).ready(function() {

		module("Application", {
			setup: function() {
				messages = [];
				Tc.Config = {
					/**
					 * The paths for the different dependency types.
					 *
					 * @property dependencyPath
					 * @type Object
					 */
					dependencies: {
						js: '../test/core/js/dependencies'
					}
				};
			},
			teardown: function() {
				delete messages;
			}
		});

        test('application context (if not set)', function() {
            expect(1);

            // instantiate the applicaton
            var application = new Tc.Application();

            // check the implicitly set context
            deepEqual(application.$ctx, $('body'), 'context node');
        });

        test('application context (if explicitly set)', function() {
            expect(1);
            var $ctx = $('.page');

            // instantiate the applicaton
            var application = new Tc.Application($ctx);

            // check the explicitly set context
            deepEqual(application.$ctx, $ctx, 'context node');
        });

        test('register module', function() {
            expect(6);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All');

            // check that the module has been registered properly
            equal(application.modules.length, 1, 'module registered');
            equal(0, Object.keys(application.connectors).length, 'no connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(module.hasOwnProperty('$ctx'), 'no skins applied');
            equal(0, Object.keys(module.connectors).length, 'no connectors');
            deepEqual(module.$ctx, $node, 'context node');
        });

        test('register module (with a skin)', function() {
            expect(6);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', ['All']);

            // check that the module has been registered properly
            equal(application.modules.length, 1, 'module registered');
            equal(0, Object.keys(application.connectors).length, 'no connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(!module.hasOwnProperty('$ctx'), 'skins applied');
            equal(0, Object.keys(module.connectors).length, 'no connectors');
            deepEqual(module.$ctx, $node, 'context node');
        });



        test('register module (with a connector)', function() {
            expect(6);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: ['1']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', null, ['1']);

            // check that the module has been registered properly
            equal(application.modules.length, 1, 'module registered');
            ok(application.connectors['1'], 'connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(module.hasOwnProperty('$ctx'), 'no skins applied');
            equal(Object.keys(module.connectors).length, 1, 'connectors applied');
            deepEqual(module.$ctx, $node, 'context node');
        });

        test('register module (with multiple skins and connectors)', function() {
            expect(7);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All', 'MoreAll'],
                    connectors: ['1', '2']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', ['All', 'MoreAll'], ['1', '2']);

            // check that the module has been registered properly
            equal(application.modules.length, 1, 'module registered');
            ok(application.connectors['1'], 'connector 1 in application');
            ok(application.connectors['2'], 'connector 2 in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(!module.hasOwnProperty('$ctx'), 'skins applied');
            equal(Object.keys(module.connectors).length, 2, 'connectors applied');
            deepEqual(module.$ctx, $node, 'context node');
        });

        test('register modules (one module, with js)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equal(application.modules.length, 1, 'module registered');
        });

        test('register modules (one with data-ignore set, one normal)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'All',
                    skins: [],
                    connectors: [],
                    attrs: ['data-ignore=true']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equal(application.modules.length, 1, 'one module registered');
        });

        test('register modules (two modules with data-ignore set)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: [],
                    attrs: ['data-ignore=true']
                },
                {
                    module: 'All',
                    skins: [],
                    connectors: [],
                    attrs: ['data-ignore=true']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equal(application.modules.length, 0, 'no modules registered');
        });

        test('register modules (one module, without js)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'NoJs',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that no module has been registered
            equal(application.modules.length, 0, 'no module registered');
        });

        test('register modules (one module, with js)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equal(application.modules.length, 1, 'module registered');
        });

        test('register modules (two modules, one with js / one without js)', function() {
            expect(1);

            // create fixture
            var modules = [
                {
                    module: 'NoJs',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equal(application.modules.length, 1, 'appropriate module registered');
        });

        test('register modules (two modules, both with js and the same connector)', function() {
            expect(3);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: [],
                    connectors: ['1']
                },
                {
                    module: 'All',
                    skins: [],
                    connectors: ['1']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the modules have been registered
            equal(application.modules.length, 2, 'appropriate modules registered');
            ok(application.connectors[1], 'connector in application');
            equal(Object.keys(application.connectors[1].components).length, 2, 'connector contains appropriate modules');
        });

        test('register modules (dash variant)', function() {
            expect(3);

            // create fixture
            var modules = [
                {
                    module: 'all',
                    skins: [],
                    connectors: ['1']
                },
                {
                    module: 'all',
                    skins: [],
                    connectors: ['1']
                }
            ];
            var template = Handlebars.compile($('#module-dash').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the modules have been registered
            equal(application.modules.length, 2, 'appropriate modules registered');
            ok(application.connectors[1], 'connector in application');
            equal(Object.keys(application.connectors[1].components).length, 2, 'connector contains appropriate modules');
        });

        test('register modules with skins (dash variant)', function() {
            expect(8);

            // create fixture
            var modules = [
                {
                    module: 'all',
                    skins: ['all', 'more-all'],
                    connectors: ['1', '2']
                },
                {
                    module: 'all',
                    skins: ['all', 'more-all'],
                    connectors: ['1', '2']
                }
            ];
            var template = Handlebars.compile($('#module-dash').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // check that the modules have been registered
            equal(application.modules.length, 2, 'appropriate modules registered');
            ok(application.connectors[1], 'connector 1 in application');
            ok(application.connectors[2], 'connector 2 in application');
            ok(!application.connectors['MasterSlave2'], 'connector MasterSlave2 not in application');
            ok(!application.modules[0].hasOwnProperty('$ctx'), 'skins applied on first module');
            ok(!application.modules[1].hasOwnProperty('$ctx'), 'skins applied on second module');
            equal(Object.keys(application.connectors[1].components).length, 2, 'connector 1 contains appropriate modules');
            equal(Object.keys(application.connectors[2].components).length, 2, 'connector 2 contains appropriate modules');
        });

        test('unregister modules (all modules)', function() {
            expect(2);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1']
                },
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // unregister modules
            application.unregisterModules();

            // check that the modules, skins and connectors have been removed
            equal(application.modules.length, 0, 'appropriate modules removed');
            ok(!application.connectors[1], 'connectors removed');
        });

        test('unregister modules (specific module)', function() {
            expect(8);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1','2']
                },
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1','2']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node1 = $('.modAll').eq(0);
            var $node2 = $('.modAll').eq(1);
            var module = application.registerModule($node1, 'All', ['All'], ['1','2']);
            application.registerModule($node2, 'All', ['All'], ['1','2']);

            // unregister modules
            application.unregisterModules([module]);

            // check that the module, skin and connector have been removed
            ok(!application.modules[0], 'module 1 removed');
            deepEqual(application.modules[1].$ctx, $node2, 'module 2 still exists');
            ok(application.connectors[1], 'connector 1 still exists');
            ok(application.connectors[2], 'connector 2 still exists');
            deepEqual(application.connectors[1].components[0], undefined, 'connector 1 component removed');
            ok(application.connectors[1].components[1], 'other connector 1 component still exists');
            deepEqual(application.connectors[2].components[0], undefined, 'connector 2 component removed');
            ok(application.connectors[2].components[1], 'other connector 2 component still exists');
        });

        test('unregister / register modules', function() {
            expect(11);

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1','2']
                },
                {
                    module: 'All',
                    skins: ['All'],
                    connectors: ['1','2']
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            var $node1 = $('.modAll').eq(0);
            var $node2 = $('.modAll').eq(1);
            var first = application.registerModule($node1, 'All', ['All'], ['1','2']);
            application.registerModule($node2, 'All', ['All'], ['1','2']);

            // unregister first module
            application.unregisterModules([first]);

            // reregister module
            var first = application.registerModule($node1, 'All', ['All'], ['1','2']);

            // check that the module, skin and connector have been removed
            ok(!application.modules[0], 'module 1 removed');
            deepEqual(application.modules[1].$ctx, $node2, 'module 2 still exists');
            deepEqual(application.modules[2].$ctx, $node1, 'module 1 exists again');
            ok(application.connectors[1], 'connector 1 still exists');
            ok(application.connectors[2], 'connector 2 still exists');
            deepEqual(application.connectors[1].components[0], undefined, 'connector 1 component removed');
            ok(application.connectors[1].components[1], 'other connector 1 component still exists');
            ok(application.connectors[1].components[2], 'connector 1 component exists again');
            deepEqual(application.connectors[2].components[0], undefined, 'connector 2 component removed');
            ok(application.connectors[2].components[1], 'other connector 2 component still exists');
            ok(application.connectors[2].components[2], 'other connector 2 component exists again');
        });

		asyncTest('register a external end hook', function() {
			expect(1);

			// create fixture
			var modules = [
				{
					module: 'All',
					skins: [],
					connectors: []
				}
			];

			var template = Handlebars.compile($('#module').html());
			$('#qunit-fixture').html(template({ modules : modules }));

			// register modules
			var application = new Tc.Application();
			application.registerModules();

			// register end hook
			application.end(function() {
				ok(true, 'end callback has been called');
				start();
			});

			application.start();
		});
    });
})(Tc.$);

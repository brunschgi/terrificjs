(function($) {
    $(document).ready(function() {

        module("Application");

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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All');

            // check that the module has been registered properly
            equals(application.modules.length, 1, 'module registered');
            deepEqual(application.connectors, {}, 'no connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(module.hasOwnProperty('$ctx'), 'no skins applied');
            ok($.isEmptyObject(module.connectors), 'no connectors');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', ['All']);

            // check that the module has been registered properly
            equals(application.modules.length, 1, 'module registered');
            deepEqual(application.connectors, {}, 'no connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(!module.hasOwnProperty('$ctx'), 'skins applied');
            ok($.isEmptyObject(module.connectors), 'no connectors');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', null, ['1']);

            // check that the module has been registered properly
            equals(application.modules.length, 1, 'module registered');
            ok(application.connectors['1'], 'connectors in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(module.hasOwnProperty('$ctx'), 'no skins applied');
            equals(Object.keys(module.connectors).length, 1, 'connectors applied');
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

            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            var $node = $('.modAll');
            var module = application.registerModule($node, 'All', ['All', 'MoreAll'], ['1', '2']);

            // check that the module has been registered properly
            equals(application.modules.length, 1, 'module registered');
            ok(application.connectors['1'], 'connector 1 in application');
            ok(application.connectors['2'], 'connector 2 in application');

            // check the module properties
            ok(module instanceof Tc.Module, 'instance of Tc.Module');
            ok(!module.hasOwnProperty('$ctx'), 'skins applied');
            equals(Object.keys(module.connectors).length, 2, 'connectors applied');
            deepEqual(module.$ctx, $node, 'context node');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // check that no module has been registered
            equals(application.modules.length, 0, 'no module registered');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equals(application.modules.length, 1, 'module registered');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // check that the module has been registered
            equals(application.modules.length, 1, 'appropriate module registered');
        });

        test('register modules 2 (two modules, both with js and the same connector)', function() {
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // check that the modules have been registered
            equals(application.modules.length, 2, 'appropriate modules registered');
            ok(application.connectors[1], 'connector in application');
            equals(Object.keys(application.connectors[1].components).length, 2, 'connector contains appropriate modules');
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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // unregister modules
            application.unregisterModules();

            // check that the modules, skins and connectors have been removed
            equals(application.modules.length, 0, 'appropriate modules removed');
            ok(!application.connectors[1], 'connectors removed');
        });

        test('unregister modules 1 (specific module)', function() {
            expect(5);

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
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            var $node1 = $('modAll:eq(0)');
            var $node2 = $('modAll:eq(1)');
            var module = application.registerModule($node1, 'All', ['All'], ['1']);
            application.registerModule($node2, 'All', ['All'], ['1']);

            // unregister modules
            application.unregisterModules([module]);

            // check that the module, skin and connector have been removed
            ok(!application.modules[0], 'module 1 removed');
            deepEqual(application.modules[1].$ctx, $node2, 'module 2 still exists');
            ok(application.connectors[1], 'connector still exists');
            deepEqual(application.connectors[1].components[0], undefined, 'connector component removed');
            ok(application.connectors[1].components[1], 'other connector component still exists');
        });
    });
})(Tc.$);

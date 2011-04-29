(function($) {
    $(document).ready(function() {

        module("Module", { setup: function() {
            messages = [];
            Tc.Config = {
                /**
                 * The paths for the different dependency types.
                 *
                 * @property dependencyPath
                 * @type Object
                 */
                dependencyPath: {
                    util: '../../test/core/js/util/'
                }
            }
        },
            teardown: function() {
                delete messages;
            }
        });

        test('lifecycle (two empty modules)', function() {

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
                    connectors: []
                }
            ];
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();
            application.stop();

            equals(messages.length, 10, '10 phases')
            equals(messages[0], 'Module All: dependencies');
            equals(messages[1], 'Module All: beforeBinding');
            equals(messages[2], 'Module All: onBinding');
            equals(messages[3], 'Module All: dependencies');
            equals(messages[4], 'Module All: beforeBinding');
            equals(messages[5], 'Module All: onBinding');
            equals(messages[6], 'Module All: afterBinding');
            equals(messages[7], 'Module All: afterBinding');
            equals(messages[8], 'Module All: stop');
            equals(messages[9], 'Module All: stop');

        });

        test('lifecycle (one empty module, with one empty skin)', function() {

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
            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();
            application.stop();

            equals(messages.length, 10, '10 phases')
            equals(messages[0], 'Skin All: dependencies');
            equals(messages[1], 'Module All: dependencies');
            equals(messages[2], 'Skin All: beforeBinding');
            equals(messages[3], 'Module All: beforeBinding');
            equals(messages[4], 'Skin All: onBinding');
            equals(messages[5], 'Module All: onBinding');
            equals(messages[6], 'Skin All: afterBinding');
            equals(messages[7], 'Module All: afterBinding');
            equals(messages[8], 'Skin All: stop');
            equals(messages[9], 'Module All: stop');

        });

        test('lifecycle (one empty module, with two empty skin)', function() {

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All', 'MoreAll'],
                    connectors: []
                }
            ];
            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules	
            var application = new Tc.Application();
            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();
            application.stop();

            equals(messages.length, 15, '15 phases')
            equals(messages[0], 'Skin MoreAll: dependencies');
            equals(messages[1], 'Skin All: dependencies');
            equals(messages[2], 'Module All: dependencies');
            equals(messages[3], 'Skin MoreAll: beforeBinding');
            equals(messages[4], 'Skin All: beforeBinding');
            equals(messages[5], 'Module All: beforeBinding');
            equals(messages[6], 'Skin MoreAll: onBinding');
            equals(messages[7], 'Skin All: onBinding');
            equals(messages[8], 'Module All: onBinding');
            equals(messages[9], 'Skin MoreAll: afterBinding');
            equals(messages[10], 'Skin All: afterBinding');
            equals(messages[11], 'Module All: afterBinding');
            equals(messages[12], 'Skin MoreAll: stop');
            equals(messages[13], 'Skin All: stop');
            equals(messages[14], 'Module All: stop');
        });

        test('lifecycle (one module - with dependencies for all phases)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Dependency',
                    skins: [],
                    connectors: []
                }
            ];

            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();
            application.stop();

            stop();

            setTimeout(function() {
                equals(messages.length, 4, '4 dependency messages')
                equals(messages[0], 'Module Dependency: dependencies');
                equals(messages[1], 'Module Dependency: dependency (beforeBinding) ready');
                equals(messages[2], 'Module Dependency: dependency (onBinding) ready');
                equals(messages[3], 'Module Dependency: dependency (afterBinding) ready');

                start();
            }, 500);

        });

        asyncTest('lifecycle (one module, with two skins - with dependencies for all phases)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Dependency',
                    skins: ['Dependency', 'MoreDependency'],
                    connectors: []
                }
            ];

            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();
            application.stop();

            setTimeout(function() {
                equals(messages.length, 12, '12 dependency messages')
                equals(messages[0], 'Skin MoreDependency: dependencies');
                equals(messages[1], 'Skin Dependency: dependencies');
                equals(messages[2], 'Module Dependency: dependencies');
                equals(messages[3], 'Skin MoreDependency: dependency (beforeBinding) ready');
                equals(messages[4], 'Skin Dependency: dependency (beforeBinding) ready');
                equals(messages[5], 'Module Dependency: dependency (beforeBinding) ready');
                equals(messages[6], 'Skin MoreDependency: dependency (onBinding) ready');
                equals(messages[7], 'Skin Dependency: dependency (onBinding) ready');
                equals(messages[8], 'Module Dependency: dependency (onBinding) ready');
                equals(messages[9], 'Skin MoreDependency: dependency (afterBinding) ready');
                equals(messages[10], 'Skin Dependency: dependency (afterBinding) ready');
                equals(messages[11], 'Module Dependency: dependency (afterBinding) ready');

                start();
            }, 500);

        });

        asyncTest('lifecycle (two modules, one empty, one with two skins - with dependencies for all phases)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Dependency',
                    skins: ['Dependency', 'MoreDependency'],
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

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 16, '16 dependency and status messages');
                equals(messages[0], 'Skin MoreDependency: dependencies');
                equals(messages[1], 'Skin Dependency: dependencies');
                equals(messages[2], 'Module Dependency: dependencies');
                equals(messages[3], 'Module All: dependencies');
                equals(messages[4], 'Module All: beforeBinding');
                equals(messages[5], 'Module All: onBinding');
                equals(messages[6], 'Skin MoreDependency: dependency (beforeBinding) ready');
                equals(messages[7], 'Skin Dependency: dependency (beforeBinding) ready');
                equals(messages[8], 'Module Dependency: dependency (beforeBinding) ready');
                equals(messages[9], 'Skin MoreDependency: dependency (onBinding) ready');
                equals(messages[10], 'Skin Dependency: dependency (onBinding) ready');
                equals(messages[11], 'Module Dependency: dependency (onBinding) ready');
                equals(messages[12], 'Module All: afterBinding');
                equals(messages[13], 'Skin MoreDependency: dependency (afterBinding) ready');
                equals(messages[14], 'Skin Dependency: dependency (afterBinding) ready');
                equals(messages[15], 'Module Dependency: dependency (afterBinding) ready');

                start();
            }, 1000);

        });

        asyncTest('lifecycle (three modules, one empty, two with two skins - with dependencies for all phases)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Dependency',
                    skins: ['Dependency', 'MoreDependency'],
                    connectors: []
                },
                {
                    module: 'All',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'Dependency',
                    skins: ['Dependency', 'MoreDependency'],
                    connectors: []
                }
            ];

            $('#module').tmpl(modules).appendTo($('#qunit-fixture'));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start and stop modules and check that the modules have a properly lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 28, '28 dependency and status messages');
                equals(messages[0], 'Skin MoreDependency: dependencies');
                equals(messages[1], 'Skin Dependency: dependencies');
                equals(messages[2], 'Module Dependency: dependencies');
                equals(messages[3], 'Module All: dependencies');
                equals(messages[4], 'Module All: beforeBinding');
                equals(messages[5], 'Module All: onBinding');
                equals(messages[6], 'Skin MoreDependency: dependencies');
                equals(messages[7], 'Skin Dependency: dependencies');
                equals(messages[8], 'Module Dependency: dependencies');
                equals(messages[9], 'Skin MoreDependency: dependency (beforeBinding) ready');
                equals(messages[10], 'Skin Dependency: dependency (beforeBinding) ready');
                equals(messages[11], 'Module Dependency: dependency (beforeBinding) ready');
                equals(messages[12], 'Skin MoreDependency: dependency (beforeBinding) ready');
                equals(messages[13], 'Skin Dependency: dependency (beforeBinding) ready');
                equals(messages[14], 'Module Dependency: dependency (beforeBinding) ready');
                equals(messages[15], 'Skin MoreDependency: dependency (onBinding) ready');
                equals(messages[16], 'Skin Dependency: dependency (onBinding) ready');
                equals(messages[17], 'Module Dependency: dependency (onBinding) ready');
                equals(messages[18], 'Skin MoreDependency: dependency (onBinding) ready');
                equals(messages[19], 'Skin Dependency: dependency (onBinding) ready');
                equals(messages[20], 'Module Dependency: dependency (onBinding) ready');
                equals(messages[21], 'Module All: afterBinding');
                equals(messages[22], 'Skin MoreDependency: dependency (afterBinding) ready');
                equals(messages[23], 'Skin Dependency: dependency (afterBinding) ready');
                equals(messages[24], 'Module Dependency: dependency (afterBinding) ready');
                equals(messages[25], 'Skin MoreDependency: dependency (afterBinding) ready');
                equals(messages[26], 'Skin Dependency: dependency (afterBinding) ready');
                equals(messages[27], 'Module Dependency: dependency (afterBinding) ready');

                start();
            }, 1000);

        });
    });
})(Tc.$);
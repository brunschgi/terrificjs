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
                dependencies: {
                    js: '../../test/core/js/dependencies'
                }
            };
        },
            teardown: function() {
                delete messages;
            }
        });

        asyncTest('dynamic connectors 1 (subscribe)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 4, '4 onTest messages received');
                equals(messages[0], 'received onTest message');
                equals(messages[1], 'received onTest message');
                equals(messages[2], 'received onTest message');
                equals(messages[3], 'received onTest message');
                start();
            }, 1000);

        });

        asyncTest('subscribe and fire to specific channel', function() {

            // create fixture
            var modules = [
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'SpecialSubscription',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 12, '12 messages received');
                equals(messages[0], 'received special onTest message');
                equals(messages[1], 'received onTest message');
                equals(messages[2], 'received onTest message');
                equals(messages[3], 'default handler executed');
                equals(messages[4], 'special default handler executed');
                equals(messages[5], 'received onTest message');
                equals(messages[6], 'empty data default handler executed');
                equals(messages[7], 'received onTest message');
                equals(messages[8], 'null default handler executed');
                equals(messages[9], 'empty special default handler executed');
                equals(messages[10], 'null special default handler executed');
                equals(messages[11], 'received special onTest message');
                start();
            }, 800);

        });

        asyncTest('dynamic connectors 2 (subscribe, unsubscribe)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'UnSubscription',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 3, '3 messages received');
                equals(messages[0], 'received onTest message');
                equals(messages[1], 'received onTest message');
                equals(messages[2], 'default handler executed');
                start();
            }, 1000);

        });


        asyncTest('dynamic connectors with 3 modules (subscribe, unsubscribe)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'Subscription',
                    skins: [],
                    connectors: []
                },
                {
                    module: 'UnSubscription',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 9, '9 messages received');
                equals(messages[0], 'received onTest message');
                equals(messages[1], 'received onTest message');
                equals(messages[2], 'received onTest message');
                equals(messages[3], 'received onTest message');
                equals(messages[4], 'received onTest message');
                equals(messages[5], 'received onTest message');
                equals(messages[6], 'default handler executed');
                equals(messages[7], 'received onTest message');
                equals(messages[8], 'received onTest message');
                start();
            }, 1000);

        });

        asyncTest('lifecycle (two empty modules)', function() {

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
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 4, '4 phases');
                equals(messages[0], 'Module All: on');
                equals(messages[1], 'Module All: on');
                equals(messages[2], 'Module All: after');
                equals(messages[3], 'Module All: after');

                start();
            }, 500);
        });

        asyncTest('lifecycle (one empty module, with one empty skin)', function() {

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
            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 4, '4 phases')
                equals(messages[0], 'Skin All: on');
                equals(messages[1], 'Module All: on');
                equals(messages[2], 'Skin All: after');
                equals(messages[3], 'Module All: after');

                start();
            }, 500);
        });

        asyncTest('lifecycle (one empty module, with two empty skin)', function() {

            // create fixture
            var modules = [
                {
                    module: 'All',
                    skins: ['All', 'MoreAll'],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();
            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 6, '6 phases')
                equals(messages[0], 'Skin MoreAll: on');
                equals(messages[1], 'Skin All: on');
                equals(messages[2], 'Module All: on');
                equals(messages[3], 'Skin MoreAll: after');
                equals(messages[4], 'Skin All: after');
                equals(messages[5], 'Module All: after');

                start();
            }, 500);
        });


        asyncTest('lifecycle (two modules, one empty, one with two skins - with yepnope dependencies)', function() {

            // create fixture
            var modules = [
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
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 8, '8 dependency and status messages');
                equals(messages[0], 'Module All: on');
                equals(messages[1], 'Skin MoreDependency: dependency ready');
                equals(messages[2], 'Skin Dependency: dependency ready');
                equals(messages[3], 'Module Dependency: dependency ready');
                equals(messages[4], 'Module All: after');
                equals(messages[5], 'Skin MoreDependency: after');
                equals(messages[6], 'Skin Dependency: after');
                equals(messages[7], 'Module Dependency: after');
                start();
            }, 1000);

        });

        asyncTest('lifecycle async (with modules that are added later)', function() {

            // create fixture
            var modules = [
                {
                    module: 'Register',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules();

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 4, '4 dependency and status messages');
                equals(messages[0], 'Module Register: on');
                equals(messages[1], 'Module Register: after');
                equals(messages[2], 'Module All: on');
                equals(messages[3], 'Module All: after');
                start();
            }, 1000);

        });

        asyncTest('lifecycle (remove modules)', function() {

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
                },
                {
                    module: 'UnregisterAll',
                    skins: [],
                    connectors: []
                }
            ];
            var template = Handlebars.compile($('#module').html());
            $('#qunit-fixture').html(template({ modules : modules }));

            // register modules
            var application = new Tc.Application();

            application.registerModules($('.modAll, .modUnregisterAll'));

            // start the modules and check that the modules have a proper lifecycle
            application.start();

            setTimeout(function() {
                equals(messages.length, 9, '9 dependency and status messages');
                equals(messages[0], 'Module All: on');
                equals(messages[1], 'Module All: on');
                equals(messages[2], 'Module UnregisterAll: on');
                equals(messages[3], 'Module All: after');
                equals(messages[4], 'Module All: after');
                equals(messages[5], 'Module UnregisterAll: after');
                equals(messages[6], 'Module All: stop');
                equals(messages[7], 'Module All: stop');
                equals(messages[8], 'Module UnregisterAll: stop');

                start();
            }, 1000);

        });
    });
})(Tc.$);
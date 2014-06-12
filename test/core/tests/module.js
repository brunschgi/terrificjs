(function($) {
    $(document).ready(function() {

        module("Module", {
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

		asyncTest('subscribe type checking', function() {

			// create fixture
			var modules = [
				{
					module: 'CheckSubscription',
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
				equal(messages.length, 2, '2 messages received');
				equal(messages[0], 'subscribe is expecting 2 parameters (connector, module)');
				equal(messages[1], 'the module param must be an instance of Tc.Module');

				start();
			}, 300);

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
                equal(messages.length, 4, '4 onTest messages received');
                equal(messages[0], 'received onTest message');
                equal(messages[1], 'received onTest message');
                equal(messages[2], 'received onTest message');
                equal(messages[3], 'received onTest message');
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
                equal(messages.length, 12, '12 messages received');
                equal(messages[0], 'received special onTest message');
                equal(messages[1], 'received onTest message');
                equal(messages[2], 'received onTest message');
                equal(messages[3], 'default handler executed');
                equal(messages[4], 'special default handler executed');
                equal(messages[5], 'received onTest message');
                equal(messages[6], 'empty data default handler executed');
                equal(messages[7], 'received onTest message');
                equal(messages[8], 'null default handler executed');
                equal(messages[9], 'empty special default handler executed');
                equal(messages[10], 'null special default handler executed');
                equal(messages[11], 'received special onTest message');
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
                equal(messages.length, 3, '3 messages received');
                equal(messages[0], 'received onTest message');
                equal(messages[1], 'received onTest message');
                equal(messages[2], 'default handler executed');
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
                equal(messages.length, 9, '9 messages received');
                equal(messages[0], 'received onTest message');
                equal(messages[1], 'received onTest message');
                equal(messages[2], 'received onTest message');
                equal(messages[3], 'received onTest message');
                equal(messages[4], 'received onTest message');
                equal(messages[5], 'received onTest message');
                equal(messages[6], 'default handler executed');
                equal(messages[7], 'received onTest message');
                equal(messages[8], 'received onTest message');
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
                equal(messages.length, 4, '4 phases');
                equal(messages[0], 'Module All: on');
                equal(messages[1], 'Module All: on');
                equal(messages[2], 'Module All: after');
                equal(messages[3], 'Module All: after');

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
                equal(messages.length, 4, '4 phases')
                equal(messages[0], 'Skin All: on');
                equal(messages[1], 'Module All: on');
                equal(messages[2], 'Skin All: after');
                equal(messages[3], 'Module All: after');

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
                equal(messages.length, 6, '6 phases')
                equal(messages[0], 'Skin MoreAll: on');
                equal(messages[1], 'Skin All: on');
                equal(messages[2], 'Module All: on');
                equal(messages[3], 'Skin MoreAll: after');
                equal(messages[4], 'Skin All: after');
                equal(messages[5], 'Module All: after');

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
                equal(messages.length, 8, '8 dependency and status messages');
                equal(messages[0], 'Module All: on');
                equal(messages[1], 'Skin MoreDependency: dependency ready');
                equal(messages[2], 'Skin Dependency: dependency ready');
                equal(messages[3], 'Module Dependency: dependency ready');
                equal(messages[4], 'Module All: after');
                equal(messages[5], 'Skin MoreDependency: after');
                equal(messages[6], 'Skin Dependency: after');
                equal(messages[7], 'Module Dependency: after');
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
                equal(messages.length, 4, '4 dependency and status messages');
                equal(messages[0], 'Module Register: on');
                equal(messages[1], 'Module Register: after');
                equal(messages[2], 'Module All: on');
                equal(messages[3], 'Module All: after');
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
                equal(messages.length, 9, '9 dependency and status messages');
                equal(messages[0], 'Module All: on');
                equal(messages[1], 'Module All: on');
                equal(messages[2], 'Module UnregisterAll: on');
                equal(messages[3], 'Module All: after');
                equal(messages[4], 'Module All: after');
                equal(messages[5], 'Module UnregisterAll: after');
                equal(messages[6], 'Module All: stop');
                equal(messages[7], 'Module All: stop');
                equal(messages[8], 'Module UnregisterAll: stop');

                start();
            }, 1000);

        });
    });
})(Tc.$);
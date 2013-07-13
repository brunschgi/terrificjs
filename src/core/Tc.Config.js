/**
 * Contains the application base config.
 * The base config can be extended or overwritten either via
 * new Application ($ctx, config) during bootstrapping the application or via
 * overriding the Tc.Config object in your project.
 *
 * @author Remo Brunschwiler
 * @namespace Tc
 * @class Config
 * @static
 */
Tc.Config = {
    /**
     * The paths for the different types of dependencies.
     *
     * @property dependencies
     * @type Object
     */
    dependencies: {
        css: '/css/dependencies',
        js: '/js/dependencies'
    }
};


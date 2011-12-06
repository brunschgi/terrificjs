/**
 * Contains the application base config.
 * The base config can be extended or overwritten either via
 * new Application ($ctx, config), during bootstrapping the application or via 
 * /public/js/Tc.Config.js in the project folder.
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
     * @property dependencyPath
     * @type Object
     */
    dependencyPath: {
        library: '/js/libraries/dynamic/',
        plugin: '/js/plugins/dynamic/',
        util: '/js/utils/dynamic/'
    }
};


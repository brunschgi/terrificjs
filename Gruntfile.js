module.exports = function (grunt) {
	grunt.initConfig({
			pkg: grunt.file.readJSON('package.json'),
			dist: 'dist',
			sources: {
				terrific_js: [
					'src/core/Tc.Start.js',
					'src/core/oo.js',
					'src/core/Tc.Config.js',
					'src/core/Tc.Application.js',
					'src/core/Tc.Sandbox.js',
					'src/core/Tc.Module.js',
					'src/core/Tc.Connector.js',
					'src/core/Tc.Utils.js',
					'src/core/Tc.Utils.String.js',
					'src/core/Tc.End.js'
				]
			},
			concat: {
				options: {
					process: true
				},
				terrific_js: {
					src: '<%= sources.terrific_js %>', dest: '<%= dist %>/<%= pkg.name %>.js'
				}
			},
			jshint: {
				options: {
					jshintrc: true
				},
				terrific_js: ['<%= dist %>/<%= pkg.name %>.js']
			},
			uglify: {
				options: {
					preserveComments: 'some'
				},
				terrific_js: {
					src: '<%= dist %>/<%= pkg.name %>.js', dest: '<%= dist %>/<%= pkg.name %>.min.js'
				}
			},
			qunit: {
				terrific_js: ['test/core/jquery.html', 'test/core/zepto.html']
			},
			yuidoc: {
				terrific_js: {
					name: '<%= pkg.name %>',
					version: '<%= pkg.version %>',
					url: '<%= pkg.url %>',
					options: {
						paths: '<%= dist %>',
						outdir: '<%= dist %>/docs/'
					}
				}
			},
			update_json: {
				bower: {
					src: 'package.json',
					dest: 'bower.json',
					fields: [
						'name',
						'version',
						'description',
						'main',
						'license'
					]
				}
			},
			clean: {
				options: {
					force: true
				}, dist: {
					src: [
						'<%= dist %>'
					]
				}
			}
		}
	);

	// load tasks
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-update-json');

	// create pipelines
	grunt.registerTask('sync-json', ['update_json:bower']);
	grunt.registerTask('build-js', ['concat:terrific_js']);
	grunt.registerTask('hint-js', ['jshint:terrific_js']);
	grunt.registerTask('min-js', ['uglify:terrific_js']);
	grunt.registerTask('test-js', ['qunit:terrific_js']);
	grunt.registerTask('doc', ['yuidoc:terrific_js']);

	// aggregate pipelines
	grunt.registerTask('default', [ // distribution
		'clean',
		'build-js',
		'hint-js',
		'sync-json',
		'doc',
		'min-js',
		'test-js'
	]);
};
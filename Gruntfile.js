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
					src: '<%= sources.terrific_js %>', dest: '<%= dist %>/<%= pkg.name %>-<%= pkg.version %>.js'
				}
			},
			jshint: {
				options: {
					jshintrc: true
				},
				terrific_js: ['<%= dist %>/<%= pkg.name %>-<%= pkg.version %>.js']
			},
			uglify: {
				options: {
					preserveComments: 'some'
				},
				terrific_js: {
					src: '<%= dist %>/<%= pkg.name %>-<%= pkg.version %>.js', dest: '<%= dist %>/<%= pkg.name %>-<%= pkg.version %>.min.js'
				}
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
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// create pipelines
	grunt.registerTask('build-js', ['concat:terrific_js']);
	grunt.registerTask('hint-js', ['jshint:terrific_js']);
	grunt.registerTask('min-js', ['uglify:terrific_js']);
	grunt.registerTask('doc', ['yuidoc:terrific_js']);

	// aggregate pipelines
	grunt.registerTask('default', [
		'clean',
		'build-js',
		'hint-js',
		'doc',
		'min-js'
	]);
};
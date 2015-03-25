var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    rename = require("gulp-rename"),
    fs = require('fs'),
    yuidoc = require("gulp-yuidoc"),
    sync = require('gulp-config-sync'),
    name = JSON.parse(fs.readFileSync('package.json', 'utf8')).name + '.js',
    files = [
        'src/oo.js',
        'src/Tc.Start.js',
        'src/Tc.Application.js',
        'src/Tc.Sandbox.js',
        'src/Tc.Module.js',
        'src/Tc.Connector.js',
        'src/Tc.Utils.js',
        'src/Tc.End.js'
    ];

gulp.task('compile', function () {
    return gulp
        .src(files)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(concat(name))
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['compile'], function () {
    return gulp
        .src('./dist/' + name)
        .pipe(uglify({ preserveComments: 'some' }))
        .pipe(rename(name.replace('.js', '.min.js')))
        .pipe(gulp.dest('./dist'));
});

gulp.task('doc', ['compile'], function () {
    return gulp
        .src('./dist/' + name)
        .pipe(yuidoc())
        .pipe(gulp.dest('./dist/docs'));
});

gulp.task('sync', function() {
	gulp.src(['bower.json'])
		.pipe(sync())
		.pipe(gulp.dest('.'));
});

gulp.task('test', ['compile'], function (done) {
    karma.start({
        configFile: path.join(__dirname, 'karma.conf.js'),
        singleRun: true,
        autoWatch: false
    }, done);
});

gulp.task('watch', ['compile'], function () {
    gulp.watch(files, ['compile']);
});

gulp.task('default', ['minify', 'test', 'doc', 'sync'], function () {});
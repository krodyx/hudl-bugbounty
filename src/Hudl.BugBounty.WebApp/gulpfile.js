/// <binding Clean='clean' ProjectOpened='install' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    run = require("gulp-run"),
    sass = require('gulp-sass'),
    plumber = require('gulp-plumber'),
    watchify = require('watchify'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    assign = require('lodash.assign'),
    tsify = require('tsify'),
    glob = require('glob');

var webroot = "./wwwroot/";

var paths = {
    js: webroot + "scripts/**/*.js",
    minJs: webroot + "scripts/**/*.min.js",
    ts: "Scripts/**/*.ts",
    tsx: "Scripts/**/*.tsx",
    sass: "Styles/**/*.scss",
    css: webroot + "css/**/*.css",
    minCss: webroot + "css/**/*.min.css",
    concatJsDest: webroot + "scripts/site.min.js",
    concatCssDest: webroot + "css/site.min.css"
};

var gulpFilePath = __dirname;
var shell = function(cmd) {
    return run(cmd, {
        "cwd": gulpFilePath
    }).exec();
}

gulp.task("install", function(cb) {
    shell("npm install -g browserify bower tsd typescript " +
        "&& tsd install");
});

var tsFiles = glob.sync("./Scripts/**/*.ts*");
gutil.log("Found " + tsFiles);
var customOpts = {
    entries: tsFiles,
    debug: true
};
var opts = assign({}, watchify.args, customOpts);

// build
var b = browserify(opts)
    .plugin(tsify, {
        //noImplicitAny: true,
        noEmitOnError: true,
        sourceMap: true,
        target: "es5",
        module: "commonjs",
        jsx: "react"
    });
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({
            loadMaps: true
        })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./wwwroot/scripts'));
}


gulp.task('build:js', bundle);

gulp.task("build:sass", function() {
    return gulp.src(paths.sass)
        .pipe(plumber())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('wwwroot/css')); //we should get this minified and bundled into one file
});

gulp.task("build", ["build:js", "build:sass"]);

// watch
var w = watchify(browserify(opts))
    .plugin(tsify, {
        //noImplicitAny: true,
        noEmitOnError: true,
        sourceMap: true,
        target: "es5",
        module: "commonjs",
        jsx: "react"
    });
w.on('update', wbundle); // on any dep update, runs the bundler
w.on('log', gutil.log); // output build logs to terminal

function wbundle() {
    return w.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        // optional, remove if you dont want sourcemaps
        .pipe(sourcemaps.init({
            loadMaps: true
        })) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./wwwroot/scripts'));
}
gulp.task('watch:js', wbundle); // so you can run `gulp watch:js` to watch the files

gulp.task("watch:sass", function(cb) {

    gulp.watch([paths.sass], ['build:sass']);
});

//gulp.task('watch:web', shell.task(['dnx-watch web']));

gulp.task('watch', ["watch:js", "watch:sass"]);

// clean
gulp.task("clean:js", function(cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function(cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

// min
gulp.task("min:js", function() {
    return gulp.src([paths.js, "!" + paths.minJs], {
            base: "."
        })
        .pipe(concat(paths.concatJsDest))
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("min:css", function() {
    return gulp.src([paths.css, "!" + paths.minCss])
        .pipe(concat(paths.concatCssDest))
        .pipe(cssmin())
        .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);
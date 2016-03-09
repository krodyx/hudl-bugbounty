/// <binding BeforeBuild='install' AfterBuild='build' Clean='clean' />
/*
This file in the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkId=518007
*/
"use strict";

/*
var gulp = require('gulp');

gulp.task('default', function () {
    // place code for your default task here
});
*/

/// <binding Clean='clean' />

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    shell = require("gulp-shell");

var webroot = "./wwwroot/";

var paths = {
    js: webroot + "scripts/**/*.js",
    minJs: webroot + "scripts/**/*.min.js",
    ts: "Scripts/**/*.ts",
    tsx: "Scripts/**/*.tsx",
    css: webroot + "css/**/*.css",
    minCss: webroot + "css/**/*.min.css",
    concatJsDest: webroot + "scripts/site.min.js",
    concatCssDest: webroot + "css/site.min.css"
};

gulp.task("install", shell.task([
    'npm install -g browserify bower tsd typescript',
    'npm install',
    'tsd install'
]))

gulp.task("build:js", shell.task([
    'tsc -p Scripts', 
    'browserify wwwroot/scripts/index.js -o wwwroot/scripts/bundle.js'
]));

gulp.task("build:css", function (cb) {
});

gulp.task("build", ["build:js", "build:css"]);

gulp.task("clean:js", function (cb) {
    rimraf(paths.concatJsDest, cb);
});

gulp.task("clean:css", function (cb) {
    rimraf(paths.concatCssDest, cb);
});

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js", function () {
    return gulp.src([paths.js, "!" + paths.minJs], {
        base: "."
    })
      .pipe(concat(paths.concatJsDest))
      .pipe(uglify())
      .pipe(gulp.dest("."));
});

gulp.task("min:css", function () {
    return gulp.src([paths.css, "!" + paths.minCss])
      .pipe(concat(paths.concatCssDest))
      .pipe(cssmin())
      .pipe(gulp.dest("."));
});

gulp.task("min", ["min:js", "min:css"]);

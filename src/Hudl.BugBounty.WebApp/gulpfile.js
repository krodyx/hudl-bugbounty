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
    run = require("gulp-run");
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

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
    return run(cmd, { "cwd": gulpFilePath }).exec();
}

gulp.task("install", function(cb) {
    shell("npm install -g browserify bower tsd typescript && tsd install");
});

var buildTS = function(rootDir){
    return shell("tsc -p Scripts/" + rootDir + 
        " && browserify wwwroot/scripts/" + rootDir + "/index.js "
     + "-o wwwroot/scripts/" + rootDir + "/bundle.js"); 
}

gulp.task("build:js", function(cb) {
    buildTS('home')
    buildTS('bounties')
});


gulp.task("build:css", function () {
    return gulp.src(paths.sass)
        .pipe(plumber())
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest('wwwroot/css')); //we should get this minified and bundled into one file
});

gulp.task("build", ["build:js", "build:css"]);

gulp.task('watch', function(cb) {
    gulp.watch([paths.ts, paths.tsx], ['build:js']);
    gulp.watch([paths.sass], ['build:css']);
});

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

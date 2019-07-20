var gulp = require('gulp');
var clean = require('gulp-clean');
var log = require("fancy-log");
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var webpack = require('webpack');

var tsProject = ts.createProject('src/tsconfig.json');

function handleError(err) {
  log("Build failed", err.message);
  process.exit(1);
}

gulp.task('clean', function () {
  return gulp.src(['build', '.tmp'], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task('ts', function () {
  return tsProject.src()
    .pipe(tsProject())
    .on('error', handleError)
    .pipe(gulp.dest('.tmp/'));
});

gulp.task('tslint', function () {
  return gulp.src(['src/**/*.ts'])
    .pipe(tslint({
      formatter: 'verbose'
    }))
    .on('error', handleError)
    .pipe(tslint.report());
});

gulp.task('webpack', function (callback) {
  webpack({
    entry: {
      bundle: "./.tmp/main.js",
    },
    output: {
      filename: "[name].js",
      path: __dirname + "/build/"
    },
    devtool: "source-map",
  }, function (err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    callback();
  });
});

gulp.task('js', gulp.series(['ts', 'webpack']));

gulp.task('html', function () {
  return gulp.src(['src/**/*.html']).pipe(gulp.dest('build/'));
});

gulp.task('build', gulp.parallel(['js', 'html']));

gulp.task('default', gulp.series(['clean', 'build']));



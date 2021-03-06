var gulp = require('gulp');
var clean = require('gulp-clean');
var log = require("fancy-log");
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var PluginError = require('plugin-error');
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
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
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
    bail: true,
    output: {
      filename: "[name].js",
      path: __dirname + "/build/"
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre"
        }
      ]
    }
  }, function (err, stats) {
    if (err) throw new PluginError("webpack", err);
    callback();
  });
});

gulp.task('js', gulp.series(['ts', 'webpack']));

gulp.task('static', function () {
  return gulp.src(['src/**/*.html', 'src/**/*.png']).pipe(gulp.dest('build/'));
});

gulp.task('build', gulp.parallel(['js', 'static']));

gulp.task('default', gulp.series(['clean', 'build']));



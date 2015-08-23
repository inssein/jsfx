var gulp = require('gulp');
var tsc = require('gulp-tsc');
var shell = require('gulp-shell');
var runseq = require('run-sequence');
var tslint = require('gulp-tslint');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var paths = {
  tscripts: {
    src:  ['src/**/*.ts', 'exports.ts'],
    dest: 'build'
  }
};

gulp.task('default', ['lint', 'buildrun']);

// ** Running ** //

gulp.task('run', shell.task([
  'node build/index.js'
]));

gulp.task('buildrun', function(cb) {
  runseq('build', 'run', cb);
});

// ** Watching ** //

gulp.task('watch', function() {
  gulp.watch(paths.tscripts.src, ['compile:typescript']);
});

gulp.task('watchrun', function() {
  gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
});

// ** Compilation ** //

gulp.task('build', ['compile:typescript']);
gulp.task('compile:typescript', function() {
  return gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: "commonjs",
      out:    "jsfx.js",
      target: "ES5"
    }))
    .pipe(gulp.dest(paths.tscripts.dest))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(paths.tscripts.dest));
});

// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function() {
  return gulp.src(paths.tscripts.src)
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});

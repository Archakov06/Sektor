var gulp = require('gulp'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  cleanCSS = require('gulp-clean-css'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  prefix = require('gulp-autoprefixer'),
  browserSync = require('browser-sync'),
  reload = browserSync.reload,
  size = require('gulp-size'),
  plumber = require('gulp-plumber'),
  notify = require('gulp-notify'),
  sassLint = require('gulp-sass-lint'),
  del = require('del'),
  vinylPaths = require('vinyl-paths'),
  sourcemaps = require('gulp-sourcemaps'),
  colors = require('colors'),
  // Temporary solution until gulp 4
  // https://github.com/gulpjs/gulp/issues/355
  runSequence = require('run-sequence');

var bases = {
  app: 'scss/',
  dist: 'dist/',
};

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
});

var displayError = function(error) {
  // Initial building up of the error
  var errorString = '[' + error.plugin.error.bold + ']';
  errorString += ' ' + error.message.replace('\n', ''); // Removes new line at the end

  // If the error contains the filename or line number add it to the string
  if (error.fileName) errorString += ' in ' + error.fileName;

  if (error.lineNumber) errorString += ' on line ' + error.lineNumber.bold;

  // This will output an error like the following:
  // [gulp-sass] error message in file_name on line 1
  console.error(errorString);
};

var onError = function(err) {
  notify.onError({
    title: 'Gulp',
    subtitle: 'Failure!',
    message: 'Error: <%= error.message %>',
    sound: 'Basso',
  })(err);
  this.emit('end');
};

var sassOptions = {
  outputStyle: 'expanded',
};

var prefixerOptions = {
  browsers: ['last 2 versions'],
};

// BUILD SUBTASKS
// ---------------

gulp.task('clean:dist', function() {
  return gulp.src(bases.dist).pipe(vinylPaths(del));
});

gulp.task('styles', function() {
  return gulp
    .src(bases.app + '/sektor.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(prefix(prefixerOptions))
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({ stream: true }))
    .pipe(
      cleanCSS({ debug: true }, function(details) {
        console.log(details.name + ': ' + details.stats.originalSize);
        console.log(details.name + ': ' + details.stats.minifiedSize);
      })
    )
    .pipe(size({ gzip: true, showFiles: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(bases.dist));
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './',
    },
  });
});

gulp.task('sass-lint', function() {
  gulp
    .src([bases.app + '**/*.scss'])
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
});

gulp.task('watch', function() {
  gulp.watch(bases.app + '**/*.scss', ['styles', browserSync.reload]);
  gulp.watch('./index.html').on('change', browserSync.reload);
});

// BUILD TASKS
// ------------

gulp.task('default', function(done) {
  runSequence('clean:dist', 'browser-sync', 'styles', 'watch', done);
});

gulp.task('build', function(done) {
  runSequence('clean:dist', 'styles', done);
});

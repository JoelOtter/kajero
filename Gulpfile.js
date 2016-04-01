var gulp = require('gulp');
var gutil = require('gulp-util');
var watchify = require('watchify');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
var exorcist = require('exorcist');

// Input file
watchify.args.debug = true;
var bundler = watchify(browserify('./src/js/app.js', watchify.args));

// Babel transform (for ES6)
bundler.transform(babelify.configure({
    sourceMapRelative: 'src/js',
    presets: ['es2015', 'react']
}));

// Recompile on updates.
bundler.on('update', bundle);

function bundle() {
    gutil.log("Recompiling JS...");

    return bundler.bundle()
        .on('error', function(err) {
            gutil.log(err.message);
            browserSync.notify("Browserify error!");
            this.emit("end");
        })
        .pipe(exorcist('src/js/dist/bundle.js.map'))
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./src/js/dist'))
        .pipe(browserSync.stream({once: true}));
}

// Gulp task aliases

gulp.task('bundle', function() {
    return bundle();
});

gulp.task('sass', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            noCache: true
        }))
        .on('error', function(err) {
            //
        })
        .pipe(gulp.dest('./src/css'))
        .pipe(browserSync.stream({once: true}));
});

// Bundle and serve page
gulp.task('default', ['sass', 'bundle'], function() {
    gulp.watch('./src/scss/*.scss', ['sass']);
    browserSync.init({
        server: './src'
    });
});
